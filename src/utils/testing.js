'use strict';

var Promise = require('promise'),
    fs = require('fs'),
    saveimage = require('save-pixels');

module.exports.promiseWriteCanvas = promiseWriteCanvas;
module.exports.promiseSaveNdarray = promiseSaveNdarray;

function promiseSaveNdarray(img, path){
    var writeStream = fs.createWriteStream(path);
    saveimage(img, 'png').pipe(writeStream);
}

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


function promiseWriteCanvas(canvas, path){
    return promiseWriteFile(path, canvas.toBuffer());
}