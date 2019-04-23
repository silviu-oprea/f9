import {questionFactory, radioAnswerOptionFactory} from "../factories/create_element_factories";
import * as utils from "../utils";

function registerAnswerTypeRadioInputsEvent(questionObj, elems) {
    let prevSelectedRadio = null;
    for (let i = 0; i < questionObj.answerTypeRadioInputs.length; i++) {
        questionObj.answerTypeRadioInputs[i].onchange = function () {
            if (this !== prevSelectedRadio) {
                prevSelectedRadio = this;
                switch (this.value) {
                    case 'radio':
                        utils.showElement(
                            questionObj.radioAnswerObj.mainDiv,
                            [questionObj.dropdownAnswerObj.mainDiv, questionObj.textAnswerObj.mainDiv]);
                        break;
                    case 'dropdown':
                        utils.showElement(
                            questionObj.dropdownAnswerObj.mainDiv,
                            [questionObj.radioAnswerObj.mainDiv, questionObj.textAnswerObj.mainDiv]);
                        break;
                    case 'text':
                        utils.showElement(
                            questionObj.textAnswerObj.mainDiv,
                            [questionObj.radioAnswerObj.mainDiv, questionObj.dropdownAnswerObj.mainDiv]);
                        break;
                    default:
                }
            }
        }
    }
}

function registerRadioAnswerEvents(question, elems) {
    const radioAnswerObj = question.radioAnswerObj;
    radioAnswerObj.addButton.onclick = function () {
        // Generate option
        const optionId = radioAnswerObj.getNextOptionId();
        const optionObj = radioAnswerOptionFactory(question.id, optionId);
        // Save option
        radioAnswerObj.idToOptionObjMap.set(optionId, optionObj);
        // Append option in DOM
        radioAnswerObj.optionsDiv.appendChild(optionObj.inputDiv);
        radioAnswerObj.optionsDiv.appendChild(optionObj.removeButtonDiv);
        // Register removal div
        optionObj.removeButton.onclick = function () {
            radioAnswerObj.optionsDiv.removeChild(optionObj.inputDiv);
            radioAnswerObj.optionsDiv.removeChild(optionObj.removeButtonDiv);
            radioAnswerObj.idToOptionObjMap.delete(optionId);
        };
    }
}

function registerDropdownAnswerEvents(question, elems) {
    const radioAnswerObj = question.dropdownAnswerObj;
    radioAnswerObj.addButton.onclick = function () {
        // Generate option
        const optionId = radioAnswerObj.getNextOptionId();
        const optionObj = radioAnswerOptionFactory(question.id, optionId);
        // Save option
        radioAnswerObj.idToOptionObjMap.set(optionId, optionObj);
        // Append option in DOM
        radioAnswerObj.optionsDiv.appendChild(optionObj.inputDiv);
        radioAnswerObj.optionsDiv.appendChild(optionObj.removeButtonDiv);
        // Register removal div
        optionObj.removeButton.onclick = function () {
            radioAnswerObj.optionsDiv.removeChild(optionObj.inputDiv);
            radioAnswerObj.optionsDiv.removeChild(optionObj.removeButtonDiv);
            radioAnswerObj.idToOptionObjMap.delete(optionId);
        };
    }
}

function registerQuestionEvents(question, elems) {
    registerAnswerTypeRadioInputsEvent(question, elems);
    registerRadioAnswerEvents(question, elems);
    registerDropdownAnswerEvents(question, elems);
}

function registerAddQuestionButtonEvent(elems) {
    const createTabObj = elems.createTabObj;
    createTabObj.addQuestionButton.onclick = function () {
        // Generate question obj
        const questionId = createTabObj.getNextQuestionId();
        const questionObj = questionFactory(questionId);
        registerQuestionEvents(questionObj, elems);
        // Save question obj in createTab elements
        createTabObj.idToQuestionObjMap.set(questionId, questionObj);
        // Append question in Dom
        createTabObj.questionsDiv.appendChild(questionObj.mainDiv);
        // Register question removal
        questionObj.removeButton.onclick = function () {
            createTabObj.questionsDiv.removeChild(questionObj.mainDiv);
            createTabObj.idToQuestionObjMap.delete(questionId);
        };
    };
}

export function registerCreateTabEvents(elems, state) {
    registerAddQuestionButtonEvent(elems, state);
}