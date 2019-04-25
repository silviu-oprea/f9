const Mustache = require('mustache');

const headerHtml =  `
    <!doctype html>
    <html lang="en">
    <head>
        <!--Import Google Icon Font-->
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <!--Import materialize.css-->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
        <!--Let browser know website is optimized for mobile-->
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body>
    <div class="container z-depth-1">
`;
const formStartTemplate = projectName =>
`
    <form action="/forms/${projectName}" id="main-form" name="main-form" method="post">
`;
const formEndHtml = '</form>';
const jsHtml = `
    <script>
        function groupBy(xs, key) {
          return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
          }, {});
        }
        
        function strMapToObj(strMap) {
            let obj = Object.create(null);
            for (let [k,v] of strMap) {
                // We don’t escape the key '__proto__'
                // which can cause problems on older engines
                if (v instanceof Map) {
                    obj[k] = strMapToObj(v);
                } else {
                    obj[k] = v;
                }
                
            }
            return obj;
        }        

        function getRadioValue(inputs) {
            for (let input of inputs) {
                if (input.checked) {
                    return input.value.trim();
                }
            }
        }
        
        function getFormData(form, prolificPid, completionCode, projectName, dataId, msgSpan) {
            msgSpan.innerText = '';
            
            const idToAnswer = new Map();

            const radios = document.getElementsByClassName('form-element-radio');
            const idToRadioGroup = groupBy(Array.from(radios), 'id');

            for (let id of Object.keys(idToRadioGroup)) {
                const value = getRadioValue(idToRadioGroup[id]) || undefined;
                if (typeof value === "undefined") {
                    msgSpan.innerText = 'Form incomplete.'
                    return;
                }
                idToAnswer.set(id, value);
            }
            
            const dropdowns = document.getElementsByClassName('form-element-dropdown');
            for (let dropdown of dropdowns) {
                const id = dropdown.id;
                const value = dropdown.value.trim() || undefined
                if (typeof value === "undefined") {
                    msgSpan.innerText = 'Form incomplete.'
                    return;
                }
                idToAnswer.set(id, value);
            }

            const texts = document.getElementsByClassName('form-element-text');
            for (let text of texts) {
                const id = text.id;
                const value = text.value.trim() || undefined
                if (typeof value === "undefined") {
                    msgSpan.innerText = 'Form incomplete.'
                    return;
                }
                idToAnswer.set(id, value);
            }
            const result = new Map();
            result.set('prolificPid', prolificPid);
            result.set('completionCode', completionCode);
            result.set('projectName', projectName);
            result.set('dataId', dataId);
            result.set('answers', idToAnswer);
            
            return result;
        }    

        function getFormDataNew(metaData, msgSpan) {
            msgSpan.innerText = '';
            const answers = [];
            for (let q of metaData.questions) {
                const el = document.getElementById(q.elementId);
            }
            console.log(metaData);
        }
        
        function submitForm(evt, form, metaData, msgSpan) {
            evt.preventDefault();
            const formData = getFormDataNew(metaData, msgSpan);
            if (typeof formData !== "undefined") {
                console.log(formData);
                // fetch('http://localhost:8090/forms/' + projectName, {
                //     headers: {
                //         'Accept': 'application/json',
                //         'Content-Type': 'application/json'
                //     },
                //     method: 'POST',
                //     body: JSON.stringify(strMapToObj(formData))
                // }).then(function (res) {
                //     return res.json();
                // }).then(function (res) {
                //     if (res.status !== 'success') {
                //         msgSpan.innerText = 'Something went wrong :( Please contact us at silviu.oprea@ed.ac.uk with a screenshot that includes this page and at least the address bar of your browser. ' + res.msg; 
                //     } else {
                //         // window.location.replace(res.redirectUrl);
                //         msgSpan.innerText = res.redirectUrl;
                //     }
                // });
            }
        }
    
        document.addEventListener('DOMContentLoaded', function() {            
            const elems = document.querySelectorAll('select');
            const instances = M.FormSelect.init(elems, {});
            
            const mainForm = document.getElementById('main-form');
            const msgSpan = document.getElementById('msg-span');
            const metaData = JSON.parse(document.getElementById('data-id-input').value);
            
            mainForm.onsubmit = function(evt) {
                submitForm(evt, this, metaData, msgSpan);
            };
        });
    </script>
`;
const footerHtml = `
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
    </body>
    </html>
`;

const titleTemplate = titleText => `
    <div class="row">
        <div class="col s12 teal-text text-darken-2">
            <h3>${titleText}</h3>        
        </div>
    </div>    
`;

const messageTemplate = messageText => `
    <div class="row">
        <div class="col s12 teal-text text-darken-2">
            <p3>${messageText}</p3>        
        </div>
    </div>
`;

const questionTemplate = (index, questionText, allAnswersHtml) =>`
    <div class="row">
        <div class="col s12 teal-text text-darken-2">
            <p><b>(${index}) ${questionText}</b></p>        
        </div>
        <div class="col s12 input-field">
            ${allAnswersHtml}            
        </div>
    </div>
`;

const radioAnswerTemplate = (id, values) => {
    const optionHtmls = [];
    for (let value of values) {
        optionHtmls.push(`
            <p>
              <label>
                <input name="${id}" id="${id}" type="radio" value="${value}" class="form-element-radio"/>
                <span>${value}</span>
              </label>
            </p>
        `);
    }
    return optionHtmls.join('');
};

const dropdownAnswerTemplate = (id, label, values) => {
    const optionHtmls = [];
    for (const value of values) {
        optionHtmls.push(`
            <option value="${value}">${value}</option>
        `);
    }
    return `
        <select id="${id}" name="${id}" class="form-element-dropdown">
            <option value="" disabled selected>Choose your option</option>
            ${optionHtmls.join('')}
        </select>
        <label>${label}</label>
    `;
};

const textAnswerTemplate = (id) => {
    return `
        <input id="${id}" name="${id}" type="text" class="form-element-text">
        <label for="${id}">Type your answer here</label>
<!--        <span class="helper-text" data-error="wrong" data-success="right">Helper text</span>    -->
    `;
};

const submitButtonTemplate = `
    <div class="row">
        <div class="col s12 teal-text text-darken-2">
            <button class="btn waves-effect waves-light" type="submit" name="action" form="main-form">
                Submit
                <i class="material-icons right">send</i>
            </button>
            <span class="red-text" id="msg-span"></span>
        </div>
    </div>    
`;

const hiddenDataTemplate = (projectName, prolificPid, completionCode, metaData) => {
    let hiddenDataHtml = `
        <input type="hidden" class="hidden hide" name="projectName" value="${projectName}" id="project-name-input">
        <input type="hidden" class="hidden hide" name="prolificPid" value="${prolificPid}" id="prolific-pid-input">
        <input type="hidden" class="hidden hide" name="completionCode" value="${completionCode}" id="completion-code-input">
        <input type="hidden" class="hidden hide" name="dataId" value='${metaData}' id="data-id-input">
    `;
    return hiddenDataHtml;
};

function genCharArray(charA, charZ) {
    let a = [], i = charA.charCodeAt(0), j = charZ.charCodeAt(0);
    for (; i <= j; ++i) {
        a.push(String.fromCharCode(i));
    }
    return a;
}
const charArray = genCharArray('a', 'z');

function generateNoDataForm(prolificPid, completionCode, projectName, questions, dataPoints) {
    const titleHtml = titleTemplate(`Welcome to ${projectName}.`);

    const questionHtmlList = [];
    const questionsMetaData = [];
    for (let questionIdx = 0; questionIdx < questions.length; questionIdx ++) {
        const question = questions[questionIdx];

        // If the question has data variables
        // we can only replicate the question as many times as we have data points.
        let numInstances = question.numInstancesPerPage;
        if (typeof dataPoints !== "undefined" && question.questionDataVars.length > 0) {
            numInstances = Math.min(numInstances, dataPoints.length);
        }

        for (let instanceIdx = 0; instanceIdx < numInstances; instanceIdx++) {
            let instanceAnswerHtml;
            const displayInstanceIdx = `${questionIdx + 1}${charArray[instanceIdx]}`;

            const elementId = `elem-${question._hid}-${instanceIdx}`;
            switch (question.answerSpec.answerType) {
                case 'radio':
                    instanceAnswerHtml = radioAnswerTemplate(elementId, question.answerSpec.options);
                    if (typeof dataPoints !== "undefined" && question.questionDataVars.length > 0) {
                        instanceAnswerHtml = Mustache.render(instanceAnswerHtml, dataPoints[instanceIdx]);
                    }
                    break;
                case 'dropdown':
                    instanceAnswerHtml = dropdownAnswerTemplate(elementId, '', question.answerSpec.options);
                    if (typeof dataPoints !== "undefined" && question.questionDataVars.length > 0) {
                        instanceAnswerHtml = Mustache.render(instanceAnswerHtml, dataPoints[instanceIdx]);
                    }
                    break;
                case 'text':
                    instanceAnswerHtml = textAnswerTemplate(elementId);
                    if (typeof dataPoints !== "undefined" && question.questionDataVars.length > 0) {
                        instanceAnswerHtml = Mustache.render(instanceAnswerHtml, dataPoints[instanceIdx]);
                    }
                    break;
                default:
            }
            let instanceQuestionText = question.text;
            if (typeof dataPoints !== "undefined" && question.questionDataVars.length > 0) {
                instanceQuestionText = Mustache.render(instanceQuestionText, dataPoints[instanceIdx]);
            }
            const instanceHtml = questionTemplate(displayInstanceIdx, instanceQuestionText, instanceAnswerHtml);
            questionHtmlList.push(instanceHtml);

            const metaDataObj = {questionHid: question._hid, elementId: elementId};
            if (typeof dataPoints !== "undefined" && question.questionDataVars.length > 0) {
                metaDataObj.dataPointHid = dataPoints[instanceIdx]._hid;
            }
            questionsMetaData.push(metaDataObj);
        }
    }

    const metaData = {
        projectName: projectName,
        prolificPid: prolificPid,
        completionCode: completionCode,
        questions: questionsMetaData
    };

    const questionsHtml = questionHtmlList.join('');
    // TODO
    const metaDataHtml = hiddenDataTemplate(projectName, prolificPid, completionCode, JSON.stringify(metaData));

    return headerHtml + formStartTemplate(projectName) + titleHtml + questionsHtml + submitButtonTemplate + metaDataHtml + formEndHtml + jsHtml + footerHtml;
}

function generateForm(prolificPid, completionCode, projectName, questions, dataPoints) {
    if (typeof dataPoints === "undefined") {
        return generateNoDataForm(prolificPid, completionCode, projectName, questions);
    } else {
        const form = generateNoDataForm(prolificPid, completionCode, projectName, questions, dataPoints);
        return form;
        // TODO
        // return Mustache.render(form, dataPoint);
    }
}

function generateMsg(title, message) {
    const titleHtml = titleTemplate(`Welcome to ${title}.`);
    const messageHtml = messageTemplate(message);
    return headerHtml + titleHtml + messageHtml + footerHtml;
}

module.exports = {
    generateForm: generateForm,
    generateMsg: generateMsg
};