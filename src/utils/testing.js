'use strict';

var Promise = require('promise'),
    fs = require('fs'),
    saveimage = require('save-pixels'),
    Canvas = require('canvas');

var samples = require('./samples.js'),
    projections = require('../math/projections.js'),
    drawFeatures = require('../visualization/drawFeatures.js'),
    drawImagePair = require('../visualization/drawImagePair.js'),
    drawMatches = require('../visualization/drawMatches.js'),
    drawEpipolarLines = require('../visualization/drawEpipolarLines.js'),
    drawHomography = require('../visualization/drawHomography.js');


module.exports.promiseWriteCanvas = promiseWriteCanvas;
module.exports.promiseSaveNdarray = promiseSaveNdarray;
module.exports.promiseVisualMatch = promiseVisualMatch;
module.exports.promiseVisualEpipolar = promiseVisualEpipolar;
module.exports.promiseVisualHomography = promiseVisualHomography;
module.exports.promiseVisualHomographyPiar = promiseVisualHomographyPiar;


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
        drawEpipolarLines(config, ctx, F, {
            color: 'green',
            amount: 60
        });
        return promiseWriteCanvas(canv, path);
    });
}

function promiseVisualHomography(path, img, H, ratio){
    ratio = ratio || 1;
    var width = Math.floor(img.shape[1]*ratio),
        height = Math.floor(img.shape[0]*ratio),
        canv = new Canvas(width, height),
        ctx = canv.getContext('2d');
    drawHomography(img, H, ctx, 0, 0, ratio);
    return promiseWriteCanvas(canv, path);
}

function promiseVisualHomographyPiar(path, i1, i2, H1, H2){
    return Promise.all([
        samples.promiseCanvasImage(i1),
        samples.promiseCanvasImage(i2)
    ]).then(function(results){

        var img1 = results[0],
            img2 = results[1],
            cam1 = samples.getCamera(i1),
            cam2 = samples.getCamera(i2),
            R1 = Matrix.create(cam1.R),
            R2 = Matrix.create(cam2.R),
            t1 = Vector.create(cam1.t),
            t2 = Vector.create(cam2.t),
            F = projections.getFundamentalMatrix(R1, t1, cam1.focal, img1, R2, t2, cam2.focal, img2),
            FF = H1.transpose().inverse().x(F).x(H2.inverse());

        var canv = new Canvas(),
            config = drawImagePair(img1, img2, canv, 800),
            ctx = canv.getContext('2d');

        drawHomography(img1, H1, ctx, 0, 0, config.ratio1);
        drawHomography(img2, H2, ctx, config.offsetX, config.offsetY, config.ratio2);
        drawEpipolarLines(config, ctx, FF, {
            color: 'green',
            amount: 60
        });
        return promiseWriteCanvas(canv, path);

    });
}