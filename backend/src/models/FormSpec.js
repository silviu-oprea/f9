const mongoose = require('mongoose');
const db = require('../db');

const FormSpecSchema = new mongoose.Schema({
    projectName: String,
    completionCode: String,
    numAnswers: Number,
    numAnswersReceived: Number,
    numAnswersPerDataPoint: Number,
    formDataVars: [String],
    data: [{}],
    questions: [{
        _hid: Number,
        text: String,
        numInstancesPerPage: Number,
        questionDataVars: [String],
        answerSpec: {
            answerType: {
                type: String,
                validate: {
                    validator: function(value) {
                        return ['radio', 'dropdown', 'text'].includes(value);
                    },
                    message: 'answerType needs to be one of [radio, dropdown, text]'
                },
            },
            options: {
                type: [String],
                required: false
            }
        }
    }]
});

FormSpecSchema.index({projectName: 1}, {unique: true});
FormSpecSchema.index({numAnswers: 1});
FormSpecSchema.index({projectName: 1, 'data._hid': 1});
FormSpecSchema.index({projectName: 1, 'data._usage_count': 1});
FormSpecSchema.index({projectName:1, 'questions._hid': 1});


const FormSpec = db.eagleDb.model('FormSpec', FormSpecSchema, 'form_spec');

module.exports = FormSpec;
