"use strict";

var Promise = require('promise'),
    _ = require('underscore'),
    Worker = require('child_process');

var DEMOS_DIR = '/home/sheep/Code/Project/web-sfm/demo',
    DEMOS_CONFIG_PATH = DEMOS_DIR + '/demos.json';

var theproject = 'Hall-Demo';

var PROCESS_POOL_SIZE = 1;
var project = _.find(require(DEMOS_CONFIG_PATH), function(p){
    return p.name === theproject;
});
var DEMO_ROOT = '/home/sheep/Code/Project/web-sfm' + project.root,
    FEATURES_ROOT = DEMO_ROOT + '/sift.json',
    RAW_MATCH_ROOT = DEMO_ROOT + '/raw-match';

var images = project.images;
var cursor1=0, cursor2=1;
function next(){
    if (cursor2 === images.length-1) {
        if (cursor1 === images.length-2) {
            return false;
        }
        else {
            cursor1 += 1;
            cursor2 = cursor1+1;
        }
    }
    else {
        cursor2 += 1;
    }
    return [images[cursor1], images[cursor2]];
}

_.range(PROCESS_POOL_SIZE).forEach(oneworker);

function oneworker(){
    var worker = Worker.fork(__dirname + '/match-process.js');
    var pair = next();
    if (pair) {
        worker.on('message', function(){
            pair = next();
            if (pair) {
                worker.send(createTask(pair));
            }
        });
        worker.send(createTask(pair));
    }

    function createTask(pair){
        return {
            features1: FEATURES_ROOT + '/' + pair[0].split('.')[0]+'.json',
            features2: FEATURES_ROOT + '/' + pair[1].split('.')[0]+'.json',
            result: RAW_MATCH_ROOT + '/' + pair[0] + '&' + pair[1] + '.json'
        };
    }

}
