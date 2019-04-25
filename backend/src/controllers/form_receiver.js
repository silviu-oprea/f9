const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const FormSpecModel = require('../models/FormSpec');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

function addIds(formSpec) {
    if (typeof formSpec.data !== "undefined") {
        let dataHid = 0;
        formSpec.numAnswersPerDataPoint = formSpec.numAnswers;
        formSpec.numAnswers = formSpec.numAnswers * formSpec.data.length;
        for (const point of formSpec.data) {
            dataHid += 1;
            point._hid = dataHid;
            point.numAnswersReceived = 0;
        }
    }
    let questionHid = 0;
    for (const question of formSpec.questions) {
        questionHid += 1;
        question._hid = questionHid;
    }
    formSpec.numAnswersReceived = 0;
    return formSpec;
}

router.post('/', function (req, res, next) {
    const formSpec = addIds(req.body);

    FormSpecModel.create(formSpec)
        .then(doc => res.json({status: 'success', formLink: `/forms/${formSpec.projectName}`}))
        .catch(err => res.json({status: 'error'}))
});

module.exports = router;