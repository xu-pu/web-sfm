'use strict';

// this is the main thread for the Structure from Motion logic
// this thread should only have one instance
// it creates new threads to do asynchronous computation tasks


// operation types
// query
// controll


/**
 * @typedef {{type: string, body: object}} SfmMsg
 */

/**
 * @typedef {{type: string, body: object}} QueryMsg
 */

/**
 * @typedef {{operation: string, body: object}} ControllMsg
 */


var threadManager = (function(){

    var POOL_SIZE = 1;

    var workers = {
        sift: [],
        matching: [],
        stereo: []
    };

    var parent = null;

    function stopAll(){}

    function config(){}

    function kill(){}

    function calculate(type, data, callback){}

    function getState(){}

    return {
        stopAll: stopAll,
        kill: kill,
        calculate: calculate,
        config: config
    };

}());

function queryLogic(msg){

}

/**
 *
 * @param {ControllMsg} msg
 */
function controllLogic(msg){
    switch (msg.operation) {
        case SFM.CONTROLL_START:
            sfmLogic.start();
            break;
        case SFM.CONTROLL_STOP:
            sfmLogic.stop();
            break;
        default:
            throw 'invalid controll operation';
            break;
    }
}

var sfmLogic = (function(){

    var currentStage = SFM.STAGE_BEFORE;

    var asyncTasks = [];

    function resume(){

    }

    function stop(){}

    function start(){}

    return {
        stop: stop,
        start: start
    };

}());


/**
 * @param {SfmMsg} e.data
 */
self.onmessage = function(e){

    switch (e.data.type) {
        case SFM.MSG_QUERY:
            queryLogic(e.data.body);
            break;
        case SFM.MSG_CONTROLL:
            controllLogic(e.data.body);
            break;
        default:
            throw 'Invalid message type';
            break;
    }

};