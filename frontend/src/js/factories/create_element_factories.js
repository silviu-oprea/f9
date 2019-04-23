import {createElement} from "../utils";

const answerTypeRadioFactory = function (questionId, value) {
    const outerSpan = createElement('span');
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

    const allOptionsDiv = createElement('div', {classList: ['input-field', 'col', 's12']});

    const addButtonDiv = createElement('div', {classList: ['col', 's12']});
    const a = createElement('a', {classList: ['btn-floating', 'btn-large', 'waves-effect', 'waves-light', 'teal']});
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
    const label = createElement('label', {attrs: {for: `question-${questionId}-radioOption-${optionId}`}}, 'Enter option');
    inputDiv.appendChild(input);
    inputDiv.appendChild(label);

    const removeButtonDiv = createElement('div', {classList: ['col', 's4']});
    const a = createElement('a', {classList: ['btn-floating', 'btn-large', 'waves-effect', 'waves-light', 'red', 'lighten-1']});
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

export function questionFactory(questionId) {
    const qDiv = createElement('div', {classList: ['row', 'z-depth-1']});

    // Main div ======================================================================= //
    const mainDiv = createElement('div', {classList: ['col', 's11']});

    // Main div: question text ======================================================== //
    const questionTextDiv = createElement('div', {classList: ['input-field', 'col', 's12']});
    const questionTextInput = createElement('input', {attrs: {id: `questionTextInput-${questionId}`, type: 'text'}});
    const questionTextInputLabel = createElement('label', {attrs: {for:  `questionTextInput-${questionId}`}}, 'Enter question');
    questionTextDiv.appendChild(questionTextInput);
    questionTextDiv.appendChild(questionTextInputLabel);

    // Main div: answer type ========================================================== //
    const answerTypeDiv = createElement('div', {classList: ['input-field', 'col', 's12']});
    const answerTypeSpan = createElement('span', {}, 'Answer type:');

    const answerTypeRadio = answerTypeRadioFactory(questionId, 'radio');
    const answerTypeDropdown = answerTypeRadioFactory(questionId, 'dropdown');
    const answerTypeText = answerTypeRadioFactory(questionId, 'text');

    answerTypeDiv.appendChild(answerTypeSpan);
    answerTypeDiv.appendChild(answerTypeRadio.outerSpan);
    answerTypeDiv.appendChild(answerTypeDropdown.outerSpan);
    answerTypeDiv.appendChild(answerTypeText.outerSpan);

    // Main div: answer div =========================================================== //
    const radioAnswerObj = radioAnswerObjFactory(questionId);
    const dropdownAnswerObj = radioAnswerObjFactory(questionId);
    const textAnswerObj = textAnswerFactory(questionId);

    mainDiv.appendChild(questionTextDiv);
    mainDiv.appendChild(answerTypeDiv);
    mainDiv.appendChild(radioAnswerObj.mainDiv);
    mainDiv.appendChild(dropdownAnswerObj.mainDiv);
    mainDiv.appendChild(textAnswerObj.mainDiv);

    // Remove button ================================================================== //
    const removeDiv = createElement('div', {classList: ['col', 's1', 'valign-wrapper']});
    const a = createElement('a', {classList: ['btn-floating', 'btn-large',  'waves-effect', 'waves-light', 'red', 'lighten-1']});
    const i = createElement('i', {classList: ['material-icons']}, 'remove');
    a.appendChild(i);
    removeDiv.appendChild(a);

    qDiv.appendChild(mainDiv);
    qDiv.appendChild(removeDiv);

    return {
        id: questionId,
        mainDiv: qDiv,
        removeButton: a,
        textInput: questionTextInput,
        answerTypeRadioInputs: [answerTypeRadio.input, answerTypeDropdown.input, answerTypeText.input],
        radioAnswerObj: radioAnswerObj,
        dropdownAnswerObj: dropdownAnswerObj,
        textAnswerObj: textAnswerObj,
    };
}