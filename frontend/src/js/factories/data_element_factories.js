import {createElement} from "../utils";

export function noQuestionErrorInfoDivContent(state) {
    const div = createElement('div', {classList: ['col', 's12']});
    const p = createElement('p', {}, "Looks like you haven't defined any questions.");
    div.appendChild(p);
    return div
}

export function stateNoDataVarsInfoDivContent(state) {
    const div = createElement('div', {classList: ['col', 's12']});
    const p = createElement('p', {}, `Thanks! I see you've defined ${state.questions.length} questions and you don't have any data variables specified.`)
    div.appendChild(p);
    return div
}

export function stateWithDataVarsInfoDivContent(state) {
    const contentDiv = createElement('div', {classList: ['col', 's12']});

    const infoP = createElement('p', {}, `Thanks! I see you've defined ${state.questions.length} questions. You've also specified ${state.formDataVars.length} data variables. They are:`);
    const ol = createElement('ol');
    for (const dataVar of state.formDataVars) {
        const li = createElement('li', {}, `${dataVar}`);
        ol.appendChild(li);
    }
    
    contentDiv.appendChild(infoP);
    contentDiv.appendChild(ol);
    return contentDiv;
}

export function createCsvDivContentObj(state) {
    const mainDiv = createElement('div', {classList: ['col', 's12']});
    const infoP = createElement('p', {}, 'Give me a CSV with your data:');

    const contentDiv = createElement('div', {classList: ['col', 's12', 'valign-wrapper']});

    const inputDiv = createElement('div', {classList: ['col', 's3', 'input-field']});
    const input = createElement('input', {attrs: {type: 'file', id: 'dataFileUpload', name: 'dataFileUpload'}});
    inputDiv.appendChild(input);

    // Percent indicator div
    const progressBarContainerDiv = createElement('div', {classList: ['col', 's2'], attrs: {id: 'data-progress-bar-container-div'}});
    const progressBarDiv = createElement('div', {classList: ['percent']}, '0%');
    progressBarContainerDiv.appendChild(progressBarDiv);
    // Cancel button div
    const cancelButtonDiv = createElement('div', {classList: ['col', 's7']});
    const a = createElement('a', {classList: ['waves-effect', 'waves-light', 'btn-small', 'grey']});
    const i = createElement('i', {classList: ['material-icons', 'left']}, 'cancel');
    const span = createElement('span', {}, 'cancel');
    a.appendChild(span);
    a.appendChild(i);
    cancelButtonDiv.appendChild(a);
    contentDiv.appendChild(inputDiv);
    contentDiv.appendChild(progressBarContainerDiv);
    contentDiv.appendChild(cancelButtonDiv);

    mainDiv.appendChild(infoP);
    mainDiv.appendChild(contentDiv);

    return {
        mainDiv: mainDiv,
        fileInput: input,
        progressBarDiv: progressBarDiv,
        cancelButton: a
    };
}

export function createSubmitDivContentMissingDataVars(missingDataVars) {
    const mainDiv = createElement('div', {classList: ['col', 's12']});

    const missingP = createElement('p', {}, "You are missing the following data variables:");
    const missingOl = createElement('ol');
    for (const dataVar of missingDataVars) {
        const li = createElement('li', {}, `${dataVar}`);
        missingOl.appendChild(li);
    }
    mainDiv.appendChild(missingP);
    mainDiv.appendChild(missingOl);

    return mainDiv;
}

export function createSubmitDivContentSubmitObj(state) {
    const mainDiv = createElement('div', {classList: ['col', 's12']});
    const infoP = createElement('p', {}, "Sweet. Some final things:");
    mainDiv.append(infoP);

    const numAnswersDiv = createElement('div', {classList: ['col', 's12', 'input-field']});
    const numAnswersInput = createElement('input', {attrs: {type: 'text', id: 'num-answers'}});
    const numAnswersLabel = createElement('label', {attrs: {for:  'num-answers'}}, 'Number of answers required');
    const numAnswersHelperSpan = createElement('span', {classList: ['helper-text']}, 'If you specified data variables, this is the number of answers per data row');
    numAnswersDiv.appendChild(numAnswersInput);
    numAnswersDiv.appendChild(numAnswersLabel);
    numAnswersDiv.appendChild(numAnswersHelperSpan);
    mainDiv.appendChild(numAnswersDiv);

    const nameDiv = createElement('div', {classList: ['col', 's12', 'input-field']});
    const nameInput = createElement('input', {attrs: {type: 'text', id: 'project-name'}});
    const nameLabel = createElement('label', {attrs: {for:  'project-name'}}, 'Give this project a name');
    const nameHelperSpan = createElement('span', {classList: ['helper-text']}, 'The link to the live version will be something like https://<STUFF>/name');
    nameDiv.appendChild(nameInput);
    nameDiv.appendChild(nameLabel);
    nameDiv.appendChild(nameHelperSpan);
    mainDiv.appendChild(nameDiv);

    const completionCodeDiv = createElement('div', {classList: ['col', 's12', 'input-field']});
    const completionCodeInput = createElement('input', {attrs: {type: 'text', id: 'completion-code-input'}});
    const completionCodeLabel = createElement('label', {attrs: {for:  'completion-code-input'}}, "What is the completion code?");
    const completionCodeHelperSpan = createElement('span', {classList: ['helper-text']}, '');
    completionCodeDiv.appendChild(completionCodeInput);
    completionCodeDiv.appendChild(completionCodeLabel);
    completionCodeDiv.appendChild(completionCodeHelperSpan);
    mainDiv.appendChild(completionCodeDiv);

    const a = createElement('a', {classList: ['waves-effect', 'waves-light', 'btn-small', 'teal']});
    const i = createElement('i', {classList: ['material-icons', 'right']}, 'send');
    const span = createElement('span', {}, 'submit');
    a.appendChild(span);
    a.appendChild(i);
    mainDiv.appendChild(a);

    return {
        mainDiv: mainDiv,
        numAnswersInput: numAnswersInput,
        projectNameInput: nameInput,
        completionCodeInput: completionCodeInput,
        submitButton: a
    };
}