"use strict";

var Promise = require('promise'),
    Worker = require('child_process');

var DEMOS_DIR = '/home/sheep/Code/Project/web-sfm/demo',
    DEMOS_CONFIG_PATH = DEMOS_DIR + '/demos.json';


var PROCESS_POOL_SIZE = 7;
var project;
//var images = project.images;
var cursor1, cursor2;


var worker = Worker.fork(__dirname + '/match-process.js');
worker.on('message', function(m){
    console.log(m);
});
worker.send('haha');

function matchAll(){

}

function next(){}

function promiseOne(name1, name2){

}

function promiseTask(task, threadID){

}