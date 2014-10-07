'use strict';

var Promise = require('promise'),
    fs = require('fs'),
    saveimage = require('save-pixels'),
    Canvas = require('canvas');

var samples = require('./samples.js'),
    drawFeatures = require('../visualization/drawFeatures.js'),
    drawImagePair = require('../visualization/drawImagePair.js'),
    drawMatches = require('../visualization/drawMatches.js'),
    drawEpipolarGeometry = require('../visualization/drawEpipolarGeometry.js');


module.exports.promiseWriteCanvas = promiseWriteCanvas;
module.exports.promiseSaveNdarray = promiseSaveNdarray;
module.exports.promiseVisualMatch = promiseVisualMatch;
module.exports.promiseVisualEpipolar = promiseVisualEpipolar;


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


function promiseVisualMatch(path, i1, i2, matches){
    return Promise.all([
        samples.promiseCanvasImage(i1),
        samples.promiseCanvasImage(i2)
    ]).then(function(results){
        var canv = new Canvas(),
            config = drawImagePair(results[0], results[1], canv, 800),
            ctx = canv.getContext('2d'),
            features1 = samples.getFeatures(i1),
            features2 = samples.getFeatures(i2);
        drawFeatures(ctx, features1, 0, 0, config.ratio1);
        drawFeatures(ctx, features2, config.offsetX, config.offsetY, config.ratio2);
        drawMatches(config, ctx, matches, features1, features2);
        return promiseWriteCanvas(canv, path);
    });
}


function promiseVisualEpipolar(path, i1, i2, F){
    return Promise.all([
        samples.promiseCanvasImage(i1),
        samples.promiseCanvasImage(i2)
    ]).then(function(results){
        var canv = new Canvas(),
            config = drawImagePair(results[0], results[1], canv, 800),
            ctx = canv.getContext('2d');
        drawEpipolarGeometry(config, ctx, F);
        return promiseWriteCanvas(canv, path);
    });
}