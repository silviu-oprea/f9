import "isomorphic-fetch"

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

function getFormDataNew(metaData, msgSpan) {
    msgSpan.innerText = '';
    const answers = [];
    for (let q of metaData.questions) {
        let answer;
        switch (q.answerType) {
            case 'radio':
                const radioInputs = document.getElementsByName(q.elementId);
                answer = getRadioValue(radioInputs);
                break;
            case 'dropdown':
                const select = document.getElementById(q.elementId);
                answer = select.value.trim();
                break;
            case 'text':
                const input = document.getElementById(q.elementId);
                answer = input.value.trim();
                break;
            default:
        }
        if (typeof answer === "undefined" || answer === "") {
            msgSpan.innerText = 'Form incomplete';
            return;
        }
        answers.push({
            questionHid: q.questionHid,
            answerType: q.answerType,
            answer: answer,
            hasData: q.hasData
        });
    }
    return {
        projectName: metaData.projectName,
        completionCode: metaData.completionCode,
        prolificPid: metaData.prolificPid,
        dataPointObjs: metaData.dataPointObjs,
        answers: answers
    }
}

function submitForm(evt, form, metaData, msgSpan) {
    evt.preventDefault();
    const formData = getFormDataNew(metaData, msgSpan);
    if (typeof formData !== "undefined") {
        console.log(formData);
        fetch('http://localhost:8090/forms/' + metaData.projectName, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(formData)
        }).then(function (res) {
            return res.json();
        }).then(function (res) {
            if (res.status !== 'success') {
                msgSpan.innerText = 'Something went wrong :( Please contact us at silviu.oprea@ed.ac.uk with a screenshot that includes this page and at least the address bar of your browser. ' + res.msg;
            } else {
                window.location.replace(res.redirectUrl);
                // msgSpan.innerText = res.redirectUrl;
            }
        });
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
