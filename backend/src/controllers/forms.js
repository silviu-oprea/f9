const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const FormSpecModel = require('../models/FormSpec');
const ResponseModel = require('../models/Response');
const form_factory = require('../factories/form_factory');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

const dataHidToStartedTime = new Map();

const minutes = 30, the_interval = minutes * 60 * 1000, diff = 10;
setInterval(function() {
    const idsToRemove = [];
    dataHidToStartedTime.forEach((timestamps, pointId, map) => {
        const nowTimestamp = new Date().getTime();
        const timestampsToRemove = [];
        for (let ts of timestamps) {
            const minutesDiff = (nowTimestamp - ts) / 1000 / 60;
            if (minutesDiff > minutes - diff) {
                timestampsToRemove.push(ts);
            }
        }
        for (let ts of timestampsToRemove) {
            console.log(`[forms.js] At my ${minutes} minute check part (a). I am removing an instance of for data point: ${pointId}`);
            timestamps.delete(ts);
        }
        if (timestamps.size === 0) {
            idsToRemove.push(pointId);
        }
    });
    console.log(`[forms.js] At my ${minutes} minute check (b). I am removing the following point ids from activeDataPointIdToStartedTimestamp: ${idsToRemove}`);
    idsToRemove.forEach(id => dataHidToStartedTime.delete(id));
}, the_interval);

function formIsCompleted(formSpec) {
    let numActivePotentialAnswers = 0;
    dataHidToStartedTime.forEach((timestampSet, pointId, map) => {
        numActivePotentialAnswers += timestampSet.size;
    });
    return formSpec.numAnswersReceived + numActivePotentialAnswers >= formSpec.numAnswers;
}

function getNextDataPoint(formSpec, blacklist) {
    if (typeof formSpec.data === "undefined") {
        return;
    }
    for (const point of formSpec.data) {
        if (blacklist.includes(point._hid)) {
            continue;
        }
        // If this point has less registered answers than it needs
        if (point.numAnswersReceived < formSpec.numAnswersPerDataPoint) {
            // If no instances of this point are given out to someone
            if (!dataHidToStartedTime.has(point._hid)) {
                const returnedTime = new Date().getTime();
                dataHidToStartedTime.set(point._hid, new Set([returnedTime]));
                return {
                    point: point,
                    returnedTime: returnedTime
                };
            } else {
                // These are instances of this data point that are given out in a form at the moment, waiting for responses
                const pointInstanceSet = dataHidToStartedTime.get(point._hid);
                const numPotentialAnswers = point.numAnswersReceived + pointInstanceSet.size;
                // Need more answers
                if (numPotentialAnswers < formSpec.numAnswersPerDataPoint) {
                    const returnedTime = new Date().getTime();
                    pointInstanceSet.add(returnedTime);
                    return {
                        point: point,
                        returnedTime: returnedTime
                    };
                }
            }
        }
    }
}

function getMostFreqDataQuestion(formSpec) {
    let max = 0;
    for (let q of formSpec.questions) {
        const hasDataVars = q.questionDataVars.length;
        if (hasDataVars > 0 && q.numInstancesPerPage > max) {
            max = q.numInstancesPerPage;
        }
    }
    return max;
}

function getNextDataPoints(numPoints, formSpec) {
    const pointsObjs = [];
    if (numPoints === 0) {
        return pointsObjs;
    }

    const blacklist = [];
    let count = 0;
    let pointObj = getNextDataPoint(formSpec, blacklist);

    while (typeof pointObj !== "undefined") {
        pointsObjs.push(pointObj);
        count += 1;
        blacklist.push(pointObj.point._hid);
        if (count >= numPoints) {
            break;
        }
        pointObj = getNextDataPoint(formSpec, blacklist);
    }
    return pointsObjs;
}

router.get('/:projectName', function (req, res, next) {
    if (typeof req.query.PROLIFIC_PID === "undefined") {
        return res.send(`Invalid Prolific Id. If you believe this is an error please contact us at silviu.oprea@ed.ac.uk with a screenshot that includes this page and the address bar of your browser. We'll reply in minutes.`);
    }

    FormSpecModel.findOne({projectName: req.params.projectName})
        .then(formSpec => {
            if (formIsCompleted(formSpec)) {
                return res.send(form_factory.generateMsg(formSpec.projectName, "Form full at the moment. Please refresh the page in 5 minutes and try again. If you still get this message please email us at silviu.oprea@ed.ac.uk with a screenshot that includes this page and the address bar of your browser. We'll reply in minutes."));
            }

            // TODO change this. All data questions should have the same number of instances.
            const numInstancesOfMostFreqDataQuestion = getMostFreqDataQuestion(formSpec);
            let dataPointObjs;
            if (numInstancesOfMostFreqDataQuestion > 0) {
                dataPointObjs = getNextDataPoints(numInstancesOfMostFreqDataQuestion, formSpec);
            }

            return res.send(form_factory.generateForm(
                req.query.PROLIFIC_PID,
                formSpec.completionCode,
                formSpec.projectName,
                formSpec.questions,
                dataPointObjs
            ))
        }).catch(err => next(err));
});

router.post('/:projectName', function (req, res, next) {
    const response = req.body;
    // Save response
    ResponseModel.create(response)
        .then(doc => {
            // For each data point used, increment numAnswersReceived for that particularly data point
            const dataHids = response.dataPointObjs.map(p => p._hid);
            const incDataPointRCPromise = FormSpecModel.update(
                {projectName: response.projectName},
                { '$inc': { 'data.$[point].numAnswersReceived': 1 } },
                {arrayFilters: [ { 'point._hid': {'$in': dataHids} } ], multi: true}
            );
            // For each data point used, increment the global numAnswersReceived.
            // If no data points were used, increment the global numAnswersReceived by 1.
            const incGeneralRCPromise = FormSpecModel.update(
                {projectName: response.projectName},
                {'$inc': {'numAnswersReceived': Math.max(1, response.dataPointObjs.length)}},
                {upsert: false, multi: true});
            Promise.all([incDataPointRCPromise, incGeneralRCPromise])
                .then(docs => {
                    // Check that both docs have been modified.
                    // Second one corresponds to incrementing the global numAnswersReceived.
                    for (let doc of docs) {
                        if (!(doc.nModified > 0)) {
                            return res.json({status: 'error', msg: 'Could not update all data points.'})
                        }
                    }
                    // Remove point from active ones.
                    for (let pObj of response.dataPointObjs) {
                        if (dataHidToStartedTime.has(pObj._hid)) {
                            dataHidToStartedTime.get(pObj._hid).delete(pObj.returnedTime);
                        }
                    }

                    res.json({
                        status: 'success',
                        redirectUrl: 'https://app.prolific.ac/submissions/complete?cc=' + response.completionCode})
            }).catch(err => {
                res.json({status: 'error', msg: err.stack});
            });
        }).catch(err => res.json({status: 'error', msg: err.stack}));
});
// router.post('/:projectName', function (req, res, next) {
//     const response = req.body;
//     return ResponseModel.create(response)
//         .then(doc => {
//             response.dataId = parseInt(response.dataId);
//             return FormSpecModel.update(
//                 {projectName: response.projectName, 'data._hid': response.dataId},
//                 {'$inc': {'data.$.numAnswersReceived': 1}},
//                 {upsert: false, multi: true})
//                 .then(doc => {
//                     if (doc.nModified === 0) {
//                         return res.json({status: 'error', msg: 'No documents modified. Maybe invalid data id.'});
//                     }
//                     return FormSpecModel.update(
//                         {projectName: response.projectName},
//                         {'$inc': {numAnswersReceived: 1}},
//                         {upsert: false, multi: true})
//                         .then(doc => {
//                             if (doc.nModified === 0) {
//                                 return res.json({status: 'error', msg: 'Cannot update main document.'});
//                             }
//                             res.json({
//                                 status: 'success',
//
//                         });
//                 }).catch(err => {
//                     res.json({status: 'error', msg: JSON.stringify(err)});
//                 })
//         }).catch(err => {
//             console.log(err);
//             res.json({status: 'error', msg: JSON.stringify(err)})
//         });
// });

module.exports = router;