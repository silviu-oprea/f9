import {registerCreateTabEvents} from "./listeners/create_event_registers";
import {registerDataTabEvents} from "./listeners/data_event_registers";

function initTabBar() {
    const tabDiv = document.getElementById('tabDiv');
    const tabDivInstance = M.Tabs.init(tabDiv, {swipeable: false, duration: 100});
    return {mainDiv: tabDiv, instance: tabDivInstance};
}

function initCreateTabObj() {
    return {
        mainDiv: document.getElementById('createTab'),
        questionsDiv: document.getElementById('questionsDiv'),
        addQuestionButton: document.getElementById('addQuestionButton'),
        nextTabButton: document.getElementById('create2dataButton'),
        lastQuestionId: 0,
        idToQuestionObjMap: new Map(),
        getNextQuestionId: function () {
            this.lastQuestionId += 1;
            return this.lastQuestionId
        }
    };
}

function initDataTabObj() {
    return {
        infoDiv: document.getElementById('infoDiv'),
        csvDiv: document.getElementById('csvDiv'),
        submitDiv: document.getElementById('submitDiv'),
        feedbackDiv: document.getElementById('feedbackDiv')
    }
}

export function initElems() {
    const elems = {};
    elems.tabBarObj = initTabBar();
    elems.createTabObj = initCreateTabObj();
    elems.dataTabObj = initDataTabObj();

    const state = {};

    registerCreateTabEvents(elems, state);
    registerDataTabEvents(elems, state);
    return elems;
}