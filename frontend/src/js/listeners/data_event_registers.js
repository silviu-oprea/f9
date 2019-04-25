import {
    createCsvDivContentObj,
    noQuestionErrorInfoDivContent,
    stateNoDataVarsInfoDivContent,
    stateWithDataVarsInfoDivContent,
    createSubmitDivContentMissingDataVars, createSubmitDivContentSubmitObj
} from "../factories/data_element_factories";
import * as utils from "../utils";
import {$} from "../lib/jquery.csv.min"
import {createElement} from "../utils";

function getAnswerRadioValue(questionObj) {
    for (let radioInput of questionObj.answerTypeRadioInputs) {
        if (radioInput.checked) {
            return radioInput.value;
        }
    }
}

function getRadioAnswerOptions(questionObj) {
    const options = [];
    questionObj.radioAnswerObj.idToOptionObjMap.forEach(function (optionObj, optionId, map) {
        const optionText = optionObj.input.value.trim();
        if (optionText.length > 0) {
            options.push(optionText);
        }
    });
    return options;
}

function getDropdownAnswerOptions(questionObj) {
    const options = [];
    questionObj.dropdownAnswerObj.idToOptionObjMap.forEach(function (optionObj, optionId, map) {
        options.push(optionObj.input.value.trim());
    });
    return options;
}

function validateQuestion(questionSpec) {
    const stage1 = questionSpec.text.length !== 0 &&
        typeof questionSpec.answerSpec.answerType !== "undefined";
    if (!stage1) {
        return false;
    }
    if (typeof questionSpec.numInstancesPerPage === "undefined" || !utils.stringIsPositiveInteger(questionSpec.numInstancesPerPage) || questionSpec.numInstancesPerPage === 0) {
        return false;
    }
    if (typeof questionSpec.answerSpec.options !== "undefined") {
        return questionSpec.answerSpec.options.length > 0;
    }
    return true;
}

const dataVarRe = /(\{\{[^(\}\})]+\}\})/g;
function getDataVars(text) {
    return text.match(dataVarRe) || [];
}

function gatherState(elems, state) {
    const questions = [];
    const dataVars = [];

    let contQuestionId = 0;
    elems.createTabObj.idToQuestionObjMap.forEach(function (questionObj, questionId, map) {
        const questionText = questionObj.textInput.value.trim();
        const numInstancesPerPage = questionObj.numInstancesPerPageInput.value;
        const questionDataVars = [];
        questionDataVars.push(...getDataVars(questionText));

        const answerSpec = {};
        answerSpec.answerType = getAnswerRadioValue(questionObj);

        switch (answerSpec.answerType) {
            case 'radio':
                answerSpec.options = getRadioAnswerOptions(questionObj);
                questionDataVars.push(...answerSpec.options.map(getDataVars).flat());
                break;
            case 'dropdown':
                answerSpec.options = getDropdownAnswerOptions(questionObj);
                questionDataVars.push(...answerSpec.options.map(getDataVars).flat());
                break;
            case 'text':
                break;
            default:
        }
        const questionSpec = {
            text: questionText,
            numInstancesPerPage: numInstancesPerPage,
            answerSpec: answerSpec,
            questionDataVars: questionDataVars
        };
        if (validateQuestion(questionSpec)) {
            contQuestionId += 1;

            questions.push(questionSpec);
            dataVars.push(...questionDataVars);
        }
    });
    state.questions = questions;
    state.formDataVars = dataVars.distinct();
}

function checkStateIntegrity(state) {
    return state.projectName.length > 0 && state.completionCode.length > 0 &&
        state.numAnswers.length > 0 && utils.stringIsPositiveInteger(state.numAnswers) &&
        state.questions.length > 0 &&
        (state.formDataVars.length === 0 || typeof state.data !== "undefined")
}

function registerSubmitListener(submitObj, state, elems) {
    submitObj.submitButton.onclick = function () {
        state.projectName = submitObj.projectNameInput.value.trim();
        state.numAnswers= submitObj.numAnswersInput.value.trim();
        state.completionCode = submitObj.completionCodeInput.value.trim();
        if (!checkStateIntegrity(state)) {
            elems.dataTabObj.feedbackDiv.innerText = "Make sure you've filled everything in correctly. Sorry I don't have better error handling yet.";
            return;
        }
        state.numAnswers = parseInt(state.numAnswers);
        elems.dataTabObj.feedbackDiv.innerText = 'Submitting...';
        console.log(JSON.stringify(state));
        fetch('http://localhost:8090/form_receiver', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(state)
        }).then(function (res) {
            return res.json();
        }).then(function (res) {
            if (res.status !== 'success') {
                elems.dataTabObj.feedbackDiv.innerText = `Oh Snap! You know what this means :(`;
            } else {
                elems.dataTabObj.feedbackDiv.innerText = `Done. Form is live at ${res.formLink}`;
            }
        });
    }
}

function registerCsvUploadDivEvents(csvDivContentObj, state, elems) {
    let reader;

    csvDivContentObj.fileInput.onchange = function (evt) {
        // Reset progressBarDiv state
        csvDivContentObj.progressBarDiv.style.width = '0%';
        csvDivContentObj.progressBarDiv.textContent = '0%';

        reader = new FileReader();
        reader.onerror = function (evt) {
            switch(evt.target.error.code) {
                case evt.target.error.NOT_FOUND_ERR:
                    alert('File Not Found!');
                    break;
                case evt.target.error.NOT_READABLE_ERR:
                    alert('File is not readable');
                    break;
                case evt.target.error.ABORT_ERR:
                    break; // noop
                default:
                    alert('An error occurred reading this file.');
            }
        };
        reader.onprogress = function (evt) {
            if (evt.lengthComputable) {
                const percentLoaded = Math.round((evt.loaded / evt.total) * 100);
                // Increase the progress bar length.
                if (percentLoaded < 100) {
                    csvDivContentObj.progressBarDiv.style.width = percentLoaded + '%';
                    csvDivContentObj.progressBarDiv.textContent = percentLoaded + '%';
                }
            }
        };
        reader.onabort = function () {
            // alert('File read cancelled');
        };
        reader.onloadstart = function() {
            // csvDivContentObj.progressBarDiv.classList.add('loading');
        };
        reader.onload = function(e) {
            // setTimeout(function () {csvDivContentObj.progressBarDiv.classList.remove('loading')}, 2000);
            const text = e.target.result;
            state.data = $.csv2Dictionary(text).map(e => {
                return e;
            });

            if (state.data.length === 0) {
                utils.setElementContent(elems.dataTabObj.submitDiv, createSubmitDivContentMissingDataVars(state.formDataVars));
                return;
            }
            const existingDataVars = Object.keys(state.data[0]).map(d => `{{${d}}}`);
            const missingDataVars = state.formDataVars.diff(existingDataVars);
            if (missingDataVars.length > 0) {
                utils.setElementContent(elems.dataTabObj.submitDiv, createSubmitDivContentMissingDataVars(missingDataVars));
                return;
            }

            const submitObj = createSubmitDivContentSubmitObj(state);
            utils.setElementContent(elems.dataTabObj.submitDiv, submitObj.mainDiv);
            registerSubmitListener(submitObj, state, elems);

            csvDivContentObj.progressBarDiv.style.width = '100%';
            csvDivContentObj.progressBarDiv.textContent = '100%';
        };
        reader.readAsText(evt.target.files[0]);
    };

    csvDivContentObj.cancelButton.onclick = function () {
        reader.abort();
    };
}

function registerTransitionFromCreateTabEvent(elems, state) {
    elems.createTabObj.nextTabButton.onclick = function () {
        gatherState(elems, state);

        if (state.questions.length === 0) {
            utils.setElementContent(elems.dataTabObj.infoDiv, noQuestionErrorInfoDivContent(state));
            elems.tabBarObj.instance.select('dataTab');
            return;
        }

        if (state.formDataVars.length === 0) {
            utils.setElementContent(elems.dataTabObj.infoDiv, stateNoDataVarsInfoDivContent(state));
            elems.tabBarObj.instance.select('dataTab');
            return;
        }

        utils.setElementContent(elems.dataTabObj.infoDiv, stateWithDataVarsInfoDivContent(state));
        const csvDivContentObj = createCsvDivContentObj(state);
        utils.setElementContent(elems.dataTabObj.csvDiv, csvDivContentObj.mainDiv);
        registerCsvUploadDivEvents(csvDivContentObj, state, elems);
        elems.tabBarObj.instance.select('dataTab');
    }
}

export function registerDataTabEvents(elems, state) {
    registerTransitionFromCreateTabEvent(elems, state);
}