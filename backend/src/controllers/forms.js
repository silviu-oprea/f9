const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const FormSpecModel = require('../models/FormSpec');
const ResponseModel = require('../models/Response');
const form_factory = require('../factories/form_factory');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

const activeDataPointIdToStartedTimestamps = new Map();

const minutes = 0.2, the_interval = minutes * 60 * 1000;
setInterval(function() {
    const idsToRemove = [];
    activeDataPointIdToStartedTimestamps.forEach((timestamps, pointId, map) => {
        const nowTimestamp = new Date().getTime();
        const timestampsToRemove = [];
        for (let ts of timestamps) {
            const minutesDiff = (nowTimestamp - ts) / 1000 / 60;
            if (minutesDiff > minutes - 0.1) {
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
    idsToRemove.forEach(id => activeDataPointIdToStartedTimestamps.delete(id));
}, the_interval);

function formIsCompleted(formSpec) {
    let numActivePotentialAnswers = 0;
    activeDataPointIdToStartedTimestamps.forEach((timestampSet, pointId, map) => {
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
        if (point.numAnswersReceived < formSpec.numAnswersPerDataPoint) {
            if (!activeDataPointIdToStartedTimestamps.has(point._hid)) {
                activeDataPointIdToStartedTimestamps.set(point._hid, new Set([new Date().getTime()]));
                return point;
            } else {
                const pointTimeSet = activeDataPointIdToStartedTimestamps.get(point._hid);
                const numPotentialAnswers = point.numAnswersReceived + pointTimeSet.size;
                if (numPotentialAnswers < formSpec.numAnswersPerDataPoint) {
                    pointTimeSet.add(new Date().getTime());
                    return point;
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
    const points = [];
    if (numPoints === 0) {
        return points;
    }

    const blacklist = [];
    let count = 0;
    let point = getNextDataPoint(formSpec, blacklist);

    while (typeof point !== "undefined") {
        points.push(point);
        count += 1;
        blacklist.push(point._hid);
        if (count >= numPoints) {
            break;
        }
        point = getNextDataPoint(formSpec, blacklist);
    }
    return points;
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

            // This is the maximum numInstancesPerPage across all questions that have questionDataVars > 0.
            const numInstancesOfmostFreqDataQuestion = getMostFreqDataQuestion(formSpec);
            let dataPoints;
            if (numInstancesOfmostFreqDataQuestion > 0) {
                dataPoints = getNextDataPoints(numInstancesOfmostFreqDataQuestion, formSpec);
            }

            return res.send(form_factory.generateForm(
                req.query.PROLIFIC_PID,
                formSpec.completionCode,
                formSpec.projectName,
                formSpec.questions,
                dataPoints
            ))
        }).catch(err => next(err));
});

router.post('/:projectName', function (req, res, next) {
    const response = req.body;
    return ResponseModel.create(response)
        .then(doc => {
            response.dataId = parseInt(response.dataId);
            return FormSpecModel.update(
                {projectName: response.projectName, 'data._hid': response.dataId},
                {'$inc': {'data.$.numAnswersReceived': 1}},
                {upsert: false, multi: true})
                .then(doc => {
                    if (doc.nModified === 0) {
                        return res.json({status: 'error', msg: 'No documents modified. Maybe invalid data id.'});
                    }
                    return FormSpecModel.update(
                        {projectName: response.projectName},
                        {'$inc': {numAnswersReceived: 1}},
                        {upsert: false, multi: true})
                        .then(doc => {
                            if (doc.nModified === 0) {
                                return res.json({status: 'error', msg: 'Cannot update main document.'});
                            }
                            res.json({
                                status: 'success',
                                redirectUrl: 'https://app.prolific.ac/submissions/complete?cc=' + response.completionCode})
                        });
                }).catch(err => {
                    res.json({status: 'error', msg: JSON.stringify(err)});
                })
        }).catch(err => {
            console.log(err);
            res.json({status: 'error', msg: JSON.stringify(err)})
        });
});

module.exports = router;