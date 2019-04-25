import {questionObjFactory, radioAnswerOptionFactory} from "../factories/create_element_factories";
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

function registerRadioAnswerObjEvents(question, elems) {
    const radioAnswerObj = question.radioAnswerObj;
    radioAnswerObj.addButton.onclick = function () {
        // Generate option object
        const optionId = radioAnswerObj.getNextOptionId();
        const optionObj = radioAnswerOptionFactory(question.id, optionId);
        // Save option in idToOptionObjMap
        radioAnswerObj.idToOptionObjMap.set(optionId, optionObj);
        // Append option in DOM and register removal
        radioAnswerObj.optionsDiv.appendChild(optionObj.inputDiv);
        radioAnswerObj.optionsDiv.appendChild(optionObj.removeButtonDiv);
        optionObj.removeButton.onclick = function () {
            radioAnswerObj.optionsDiv.removeChild(optionObj.inputDiv);
            radioAnswerObj.optionsDiv.removeChild(optionObj.removeButtonDiv);
            radioAnswerObj.idToOptionObjMap.delete(optionId);
        };
    }
}

function registerDropdownAnswerObjEvents(question, elems) {
    const radioAnswerObj = question.dropdownAnswerObj;
    radioAnswerObj.addButton.onclick = function () {
        // Generate option object
        const optionId = radioAnswerObj.getNextOptionId();
        const optionObj = radioAnswerOptionFactory(question.id, optionId);
        // Save option in idToOptionObjMap
        radioAnswerObj.idToOptionObjMap.set(optionId, optionObj);
        // Append option in DOM and register removal
        radioAnswerObj.optionsDiv.appendChild(optionObj.inputDiv);
        radioAnswerObj.optionsDiv.appendChild(optionObj.removeButtonDiv);
        optionObj.removeButton.onclick = function () {
            radioAnswerObj.optionsDiv.removeChild(optionObj.inputDiv);
            radioAnswerObj.optionsDiv.removeChild(optionObj.removeButtonDiv);
            radioAnswerObj.idToOptionObjMap.delete(optionId);
        };
    }
}

function registerQuestionObjEvents(question, elems) {
    registerAnswerTypeRadioInputsEvent(question, elems);
    registerRadioAnswerObjEvents(question, elems);
    registerDropdownAnswerObjEvents(question, elems);
}

function registerAddQuestionButtonEvent(elems) {
    const createTabObj = elems.createTabObj;
    createTabObj.addQuestionButton.onclick = function () {
        // Generate question obj and register its events
        const questionId = createTabObj.getNextQuestionId();
        const questionObj = questionObjFactory(questionId);
        registerQuestionObjEvents(questionObj, elems);
        // Save question obj in createTab.idToQuestionObjMap
        createTabObj.idToQuestionObjMap.set(questionId, questionObj);
        // Append question in Dom and register question removal
        createTabObj.questionsDiv.appendChild(questionObj.mainDiv);
        questionObj.removeButton.onclick = function () {
            createTabObj.questionsDiv.removeChild(questionObj.mainDiv);
            createTabObj.idToQuestionObjMap.delete(questionId);
        };
    };
}

export function registerCreateTabEvents(elems, state) {
    registerAddQuestionButtonEvent(elems, state);
}