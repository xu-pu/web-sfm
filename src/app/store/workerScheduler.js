'use strict';

module.exports.promiseThreads = promiseThreads;
module.exports.setPoolSize = setPoolSize;


var ready = initialize(),
    threads;

function promiseThreads(){
   return ready.then(function(){
       return threads;
   });
}

function setPoolSize(){}

function initialize(){}

function suspend(){}

function resume(){}

function promiseOneTask(){}