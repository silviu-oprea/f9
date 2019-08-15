import {createElement} from "../utils";

const answerTypeRadioFactory = function (questionId, value) {
    const outerSpan = createElement('span', {classList: ['create-answer-type-radios']});
    const label = createElement('label');
    const input = createElement('input', {attrs: {name: `answerTypeRadios-${questionId}`, type: 'radio', value: value}});
    const innerSpan = createElement('span', {}, value);

    label.appendChild(input);
    label.appendChild(innerSpan);
    outerSpan.appendChild(label);

    return {
        outerSpan: outerSpan,
        input: input
    };
};

function radioAnswerObjFactory(questionId) {
    const mainDiv = createElement('div', {classList: ['col', 's12', 'hide']});

    const allOptionsDiv = createElement('div', {classList: ['col', 's12']});

    const addButtonDiv = createElement('div', {classList: ['col', 's12']});
    const a = createElement('a', {classList: ['btn-floating', 'waves-effect', 'waves-light', 'teal']});
    const i = createElement('i', {classList: ['material-icons']}, 'add');
    a.appendChild(i);
    addButtonDiv.appendChild(a);

    mainDiv.appendChild(allOptionsDiv);
    mainDiv.appendChild(addButtonDiv);

    return {
        mainDiv: mainDiv,
        optionsDiv: allOptionsDiv,
        addButton: a,
        idToOptionObjMap: new Map(),
        lastOptionId: 0,
        getNextOptionId: function () {
            this.lastOptionId += 1;
            return this.lastOptionId
        }
    };
}

export function radioAnswerOptionFactory(questionId, optionId) {
    const inputDiv = createElement('div', {classList: ['input-field', 'col', 's8']});
    const input = createElement('input', {attrs: {type: 'text', id: `question-${questionId}-radioOption-${optionId}`}});
    // input.value = 'It says: {{ANIMAL_SOUND}}';
    const label = createElement('label', {attrs: {for: `question-${questionId}-radioOption-${optionId}`}}, 'Enter option');
    inputDiv.appendChild(input);
    inputDiv.appendChild(label);

    const removeButtonDiv = createElement('div', {classList: ['col', 's4', 'create-remove-option-button']});
    const a = createElement('a', {classList: ['btn-floating', 'waves-effect', 'waves-light', 'red', 'lighten-1']});
    const i = createElement('i', {classList: ['material-icons']}, 'remove');
    a.appendChild(i);
    removeButtonDiv.appendChild(a);

    return {
        input: input,
        removeButton: a,
        inputDiv: inputDiv,
        removeButtonDiv: removeButtonDiv
    }
}

function textAnswerFactory(questionId) {
    const mainDiv = createElement('div', {classList: ['col', 's12', 'hide']});

    return {
        mainDiv: mainDiv
    };
}

export function questionObjFactory(questionId) {
    const mainDiv = createElement('div', {classList: ['row', 'create-question-div']});

    // 1) Questions div =============================================================== //
    const questionsDiv = createElement('div', {classList: ['col', 's11', 'z-depth-1']});

    // 1a) Questions div: question text div =========================================== //
    const questionTextDiv = createElement('div', {classList: ['input-field', 'col', 's12']});
    // const questionTextInput = createElement('input', {attrs: {id: `questionTextInput-${questionId}`, type: 'text'}});
    const questionTextTextarea = createElement('textarea', {classList: ['materialize-textarea'], attrs: {id: `questionTextInput-${questionId}`, type: 'text'}});
    // questionTextInput.value = 'What does the {{ANIMAL}} say?';
    const questionTextInputLabel = createElement('label', {attrs: {for:  `questionTextInput-${questionId}`}}, 'Enter question');
    // questionTextDiv.appendChild(questionTextInput);
    questionTextDiv.appendChild(questionTextTextarea);
    questionTextDiv.appendChild(questionTextInputLabel);

    const numInstancesPerPageDiv = createElement('div', {classList: ['input-field', 'col', 's12']});
    const numInstancesPerPageInput = createElement('input', {attrs: {id: `numInstancesPerPageInput-${questionId}`, type: 'number'}});
    const numInstancesPerPageLabel = createElement('label', {attrs: {for:  `numInstancesPerPageInput-${questionId}`}}, 'Number of instances of this question per page');
    numInstancesPerPageDiv.appendChild(numInstancesPerPageInput);
    numInstancesPerPageDiv.appendChild(numInstancesPerPageLabel);

    // 1b) Questions div: answer type radios div======================================= //
    const answerTypeDiv = createElement('div', {classList: ['input-field', 'col', 's12']});
    const answerTypeSpan = createElement('span', {}, 'Answer type:');

    const answerTypeRadio = answerTypeRadioFactory(questionId, 'radio');
    const answerTypeDropdown = answerTypeRadioFactory(questionId, 'dropdown');
    const answerTypeText = answerTypeRadioFactory(questionId, 'text');

    answerTypeDiv.appendChild(answerTypeSpan);
    answerTypeDiv.appendChild(answerTypeRadio.outerSpan);
    answerTypeDiv.appendChild(answerTypeDropdown.outerSpan);
    answerTypeDiv.appendChild(answerTypeText.outerSpan);

    // 1c) Questions div: divs for each answer type =================================== //
    const radioAnswerObj = radioAnswerObjFactory(questionId);
    const dropdownAnswerObj = radioAnswerObjFactory(questionId);
    const textAnswerObj = textAnswerFactory(questionId);

    questionsDiv.appendChild(questionTextDiv);
    questionsDiv.appendChild(numInstancesPerPageDiv);
    questionsDiv.appendChild(answerTypeDiv);
    questionsDiv.appendChild(radioAnswerObj.mainDiv);
    questionsDiv.appendChild(dropdownAnswerObj.mainDiv);
    questionsDiv.appendChild(textAnswerObj.mainDiv);

    // 2) Remove button ================================================================== //
    const removeButtonDiv = createElement('div', {classList: ['col', 's1']});
    const a = createElement('a', {classList: ['btn-floating', 'btn-large',  'waves-effect', 'waves-light', 'red', 'lighten-1']});
    const i = createElement('i', {classList: ['material-icons']}, 'remove');
    a.appendChild(i);
    removeButtonDiv.appendChild(a);

    mainDiv.appendChild(questionsDiv);
    mainDiv.appendChild(removeButtonDiv);

    return {
        id: questionId,
        mainDiv: mainDiv,
        removeButton: a,
        // textInput: questionTextInput,
        textInput: questionTextTextarea,
        numInstancesPerPageInput: numInstancesPerPageInput,
        answerTypeRadioInputs: [answerTypeRadio.input, answerTypeDropdown.input, answerTypeText.input],
        radioAnswerObj: radioAnswerObj,
        dropdownAnswerObj: dropdownAnswerObj,
        textAnswerObj: textAnswerObj,
    };
}