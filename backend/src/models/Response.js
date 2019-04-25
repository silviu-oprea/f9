const mongoose = require('mongoose');
const db = require('../db');

const ResponseSchema = new mongoose.Schema({
    projectName: String,
    prolificPid: String,
    dataId: Number,
    answers: [{}]
});

ResponseSchema.index({projectName: 1});
ResponseSchema.index({prolificPid: 1});
ResponseSchema.index({projectName: 1, dataId: 1});
const Response = db.eagleDb.model('Response', ResponseSchema, 'response');

module.exports = Response;
