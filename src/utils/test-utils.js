'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Canvas = require('canvas'),
    Promise = require('promise'),
    fs = require('fs'),
    saveimage = require('save-pixels'),
    getPixels = require('get-pixels'),
    grayscale = require('luminance'),
    Image = require('canvas').Image;

var samples = require('./samples.js'),
    randomUtils = require('./random.js'),
    laUtils = require('../math/la-utils.js'),
    projections = require('../math/projections.js'),
    drawFeatures = require('../visualization/drawFeatures.js'),
    drawImagePair = require('../visualization/drawImagePair.js'),
    drawMatches = require('../visualization/drawMatches.js'),
    drawEpipolarLines = require('../visualization/drawEpipolarLines.js'),
    drawHomography = require('../visualization/drawHomography.js'),
    drawDetailedMatch = require('../visualization/drawDetailedMatch.js');


//=====================================================
// Image loading utilities
//=====================================================


/**
 *
 * @param {string} path
 * @param {boolean} isRGB
 * @returns {Promise}
 */
module.exports.promiseImage = function(path ,isRGB){
    return new Promise(function(resolve, reject){
        getPixels(path, function(err, img){
            console.log('image loaded');
            if (isRGB) {
                resolve(img);
            }
            else {
                resolve(grayscale(img));
            }
        });
    });
};


/**
 *
 * @param {string} path
 * @returns {Promise}
 */
module.exports.promiseCanvasImage = function(path){
    return new Promise(function(resolve, reject){
        fs.readFile(path, function(err, buffer){
            if (err) {
                console.log('load failed');
                reject(err);
            }
            var img = new Image;
            img.src = buffer;
            resolve(img);
        });
    });
};


//=====================================================
// Data saving utilities
//=====================================================


/**
 * @param {string} path
 * @param img
 */
module.exports.promiseSaveNdarray = function(path, img){
    var writeStream = fs.createWriteStream(path);
    saveimage(img, 'png').pipe(writeStream);
};


/**
 *
 * @param {string} path
 * @param {ArrayBuffer} buffer
 * @returns {Promise}
 */
module.exports.promiseWriteFile = function(path, buffer){
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
};


/**
 *
 * @param {Canvas} canvas
 * @param {string} path
 * @returns {Promise}
 */
module.exports.promiseWriteCanvas = function(path, canvas){
    return exports.promiseWriteFile(path, canvas.toBuffer());
};


/**
 * Save json to file
 * @param {string} path
 * @param {Object} obj
 * @returns {Promise}
 */
module.exports.promiseSaveJson = function(path, obj){
    return exports.promiseWriteFile(path, JSON.stringify(obj));
};


//=====================================================
// Common visualization utilities
//=====================================================


/**
 *
 * @param {string} resultPath
 * @param {string} sourcePath
 * @param {RowCol[]} points
 * @param [options]
 * @returns {Promise}
 */
module.exports.promiseVisualPoints = function(resultPath, sourcePath, points, options){

    options = options || {};

    _.defaults(options, {
        fixedWidth: 1200
    });

    return exports.promiseCanvasImage(sourcePath)
        .then(function(img){
            var ratio = options.fixedWidth/img.width,
                width = options.fixedWidth,
                height = img.height*ratio,
                canv = new Canvas(width, height),
                ctx = canv.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            drawFeatures(ctx, points, 0, 0, ratio);
            return exports.promiseWriteCanvas(resultPath, canv);
        });

};