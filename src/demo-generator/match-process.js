'use strict';

var Promise = require('promise'),
    fs = require('fs');

var bruteforce = require('../webregister/bruteforce-matching.js');

function promiseWriteFile(path, buffer){
    return new Promise(function(resolve, reject){
        fs.writeFile(path, buffer, function(err){
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

process.on('message', function(msg){
    var features1 = require(msg.features1).features,
        features2 = require(msg.features2).features;
    var matches = bruteforce(features1, features2, 0.8);
    promiseWriteFile(msg.result, JSON.stringify(matches)).then(function(){
        process.send(true);
    });
});