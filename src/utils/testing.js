'use strict';

var Promise = require('promise'),
    fs = require('fs'),
    _ = require('underscore'),
    saveimage = require('save-pixels'),
    Canvas = require('canvas'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var samples = require('./samples.js'),
    projections = require('../math/projections.js'),
    drawFeatures = require('../visualization/drawFeatures.js'),
    drawImagePair = require('../visualization/drawImagePair.js'),
    drawMatches = require('../visualization/drawMatches.js'),
    drawEpipolarLines = require('../visualization/drawEpipolarLines.js'),
    drawHomography = require('../visualization/drawHomography.js'),
    drawDetailedMatch = require('../visualization/drawDetailedMatch.js');


module.exports.promiseWriteCanvas = promiseWriteCanvas;
module.exports.promiseSaveNdarray = promiseSaveNdarray;
module.exports.promiseVisualMatch = promiseVisualMatch;
module.exports.promiseVisualEpipolar = promiseVisualEpipolar;
module.exports.promiseVisualHomography = promiseVisualHomography;
module.exports.promiseVisualHomographyPiar = promiseVisualHomographyPiar;
module.exports.promiseVisualPoints = promiseVisualPoints;

//==================================================

/**
 * @param {string} path
 * @param {int} i1
 * @param {int} i2
 * @param {int[][]} matches
 * @returns {Promise}
 */
module.exports.promiseDetailedMatches = function(path, i1, i2, matches){

    var data = samples.getTwoView(i1, i2),
        fmatrix = projections.getFundamentalMatrix(data.R1, data.t1, data.f1, data.cam1, data.R2, data.t2, data.f2, data.cam2),
        features1 = samples.getFeatures(i1),
        features2 = samples.getFeatures(i2);

    return Promise.all([
        samples.promiseCanvasImage(i1),
        samples.promiseCanvasImage(i2)
    ]).then(function(results){
        var canv = new Canvas(),
            config = drawImagePair(results[0], results[1], canv, 1200),
            ctx = canv.getContext('2d');
        matches.forEach(function(match){
            drawDetailedMatch(ctx, config, fmatrix, match, getRandomColor(), features1, features2, data.cam1, data.cam2);
        });
        return exports.promiseWriteCanvas(canv, path);
    });

};

//==================================================

function getRandomColor(){

    return 'rgb(' + getInt() + ',' + getInt() + ',' + getInt() + ')';

    function getInt(){
        return Math.floor(255*Math.random());
    }

}

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

function promiseVisualPoints(path, index, points, options){

    options = options || {};
    _.defaults(options, {
       fixedWidth: 800
    });

    return samples
        .promiseCanvasImage(index)
        .then(function(img){
            var ratio = options.fixedWidth/img.width,
                width = options.fixedWidth,
                height = img.height*ratio,
                canv = new Canvas(width, height),
                ctx = canv.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            drawFeatures(ctx, points, 0, 0, ratio);
            return promiseWriteCanvas(canv, path);
        });
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
        samples.promiseCanvasImage(i2),
        samples.promiseImage(i1),
        samples.promiseImage(i2)
    ]).then(function(results){

        var img1 = results[0],
            img2 = results[1],
            imgdata1 = results[2],
            imgdata2 = results[3],
            data = samples.getTwoView(i1, i2),
            cam1 = data.cam1, cam2 = data.cam2,
            R1 = data.R1, R2 = data.R2,
            t1 = data.t1, t2 = data.t2,
            F = projections.getFundamentalMatrix(R1, t1, data.f1, cam1, R2, t2, data.f2, cam2),
            FF = normalizeMatrix(H1.transpose().inverse().x(F).x(H2.inverse()));

        var canv = new Canvas(),
            config = drawImagePair(img1, img2, canv, 800),
            ctx = canv.getContext('2d');

        drawHomography(imgdata1, H1, ctx, 0, 0, config.ratio1);
        drawHomography(imgdata2, H2, ctx, config.offsetX, config.offsetY, config.ratio2);
        drawEpipolarLines(config, ctx, FF, {
            color: 'green',
            amount: 60
        });

        return promiseWriteCanvas(canv, path);

    });
}


function normalizeMatrix(m){
    var modulus = Vector.create(_.flatten(m.elements)).modulus();
    return m.x(1/modulus);
}