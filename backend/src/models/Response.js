const mongoose = require('mongoose');
const db = require('../db');

const ResponseSchema = new mongoose.Schema({
    projectName: String,
    completionCode: String,
    prolificPid: String,
    dataPointObjs: [{}],
    answers: [{
        // questionHid: Number,
        // answerType: String,
        // answer: String,
        // hasData: Bool
    }]
}, {strict: false});

ResponseSchema.index({projectName: 1});
ResponseSchema.index({prolificPid: 1});
ResponseSchema.index({projectName: 1, 'answers.dataPointHid': 1});
const Response = db.eagleDb.model('Response', ResponseSchema, 'response');

module.exports = Response;
