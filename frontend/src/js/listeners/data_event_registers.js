
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
        typeof questionSpec.answerSpec.type !== "undefined";
    if (!stage1) {
        return false;
    }
    if (typeof questionSpec.answerSpec.options !== "undefined") {
        return questionSpec.answerSpec.options.length > 0;
    }
    return true;
}

const dataVarRe = /(\$\{[^\$]+\})/g;
function getDataVars(text) {
    return text.match(dataVarRe) || [];
}

function gatherState(elems, state) {
    const questions = [];
    const dataVars = [];
    elems.createTabObj.idToQuestionObjMap.forEach(function (questionObj, questionId, map) {
        const questionText = questionObj.textInput.value.trim();
        const questionDataVars = [];
        questionDataVars.push(...getDataVars(questionText));

        const answerSpec = {};
        answerSpec.type = getAnswerRadioValue(questionObj);

        switch (answerSpec.type) {
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
            answerSpec: answerSpec,
        };
        if (validateQuestion(questionSpec)) {
            questions.push(questionSpec);
            dataVars.push(...questionDataVars);
        }
    });
    state.questions = questions;
    state.dataVars = dataVars;
}

function registerTransitionFromCreateTabEvent(elems, state) {
    elems.createTabObj.nextTabButton.onclick = function () {
        gatherState(elems, state);
        elems.tabBarObj.instance.select('dataTab');
        console.log(state);
    }
}

export function registerDataTabEvents(elems, state) {
    registerTransitionFromCreateTabEvent(elems, state);
}