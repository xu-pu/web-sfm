'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Canvas = require('canvas'),
    Promise = require('promise'),
    fs = require('fs');

var samples = require('./samples.js'),
    testUtils = require('./test-utils.js'),
    randomUtils = require('./random.js'),
    laUtils = require('../math/la-utils.js'),
    projections = require('../math/projections.js'),
    drawFeatures = require('../visualization/features.js').fromRC,
    drawImagePair = require('../visualization/matches.js').drawImagePair,
    drawMatches = require('../visualization/matches.js').drawMatches,
    drawEpipolarLines = require('../visualization/drawEpipolarLines.js'),
    drawHomography = require('../visualization/drawHomography.js'),
    drawDetailedMatch = require('../visualization/matches.js').drawDetailedMatches;

//==================================================


/**
 * Save json to file
 * @param {string} path
 * @param {Object} obj
 * @returns {Promise}
 */
module.exports.promiseSaveJson = function(path, obj){
    return testUtils.promiseWriteFile(path, JSON.stringify(obj));
};


/**
 * @param {string} path
 * @param {int} i1
 * @param {int} i2
 * @param {int[][]} matches
 * @param {Matrix} [F]
 * @returns {Promise}
 */
module.exports.promiseDetailedMatches = function(path, i1, i2, matches, F){

    var data = samples.getTwoView(i1, i2),
        fmatrix = F || projections.getFundamentalMatrix(data.R1, data.t1, data.f1, data.cam1, data.R2, data.t2, data.f2, data.cam2),
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
            drawDetailedMatch(ctx, config, fmatrix, match, randomUtils.genRGBString(), features1, features2, data.cam1, data.cam2);
        });
        return testUtils.promiseWriteCanvas(path, canv);
    });

};


/**
 *
 * @param {string} path
 * @param {int} i1
 * @param {int} i2
 * @param {int[][]} matches
 * @returns {Promise}
 */
module.exports.promiseVisualMatch = function(path, i1, i2, matches){
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
        return testUtils.promiseWriteCanvas(path, canv);
    });
};


/**
 *
 * @param {string} path
 * @param {int} i1
 * @param {int} i2
 * @param {Matrix} F
 * @returns {Promise}
 */
module.exports.promiseVisualEpipolar = function(path, i1, i2, F){
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
        return testUtils.promiseWriteCanvas(path, canv);
    });
};


/**
 *
 * @param {string} path
 * @param {int} index
 * @param {RowCol[]} points
 * @param [options]
 * @returns {Promise}
 */
module.exports.promiseVisualPoints = function(path, index, points, options){
    return testUtils.promiseVisualPoints(path, samples.getImagePath(index), points, options);
};


/**
 *
 * @param {string} path
 * @param {int} i1
 * @param {int} i2
 * @param {Matrix} H1
 * @param {Matrix} H2
 * @returns {Promise}
 */
module.exports.promiseVisualHomographyPiar = function(path, i1, i2, H1, H2){
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
            FF = laUtils.normalizedMatrix(H1.transpose().inverse().x(F).x(H2.inverse()));

        var canv = new Canvas(),
            config = drawImagePair(img1, img2, canv, 800),
            ctx = canv.getContext('2d');

        drawHomography(imgdata1, H1, ctx, 0, 0, config.ratio1);
        drawHomography(imgdata2, H2, ctx, config.offsetX, config.offsetY, config.ratio2);
        drawEpipolarLines(config, ctx, FF, {
            color: 'green',
            amount: 60
        });

        return testUtils.promiseWriteCanvas(path, canv);

    });
};


/**
 *
 * @param {string} path
 * @param img
 * @param {Matrix} H
 * @param {number} ratio
 * @returns {Promise}
 */
module.exports.promiseVisualHomography = function(path, img, H, ratio){
    ratio = ratio || 1;
    var width = Math.floor(img.shape[1]*ratio),
        height = Math.floor(img.shape[0]*ratio),
        canv = new Canvas(width, height),
        ctx = canv.getContext('2d');
    drawHomography(img, H, ctx, 0, 0, ratio);
    return testUtils.promiseWriteCanvas(path, canv);
};