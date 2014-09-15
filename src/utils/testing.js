'use strict';

var Promise = require('promise');

module.exports.promiseWriteCanvas = promiseWriteCanvas;


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