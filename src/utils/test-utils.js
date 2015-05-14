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
    Image = require('canvas').Image,
    toArrayBuffer = require('buffer-to-arraybuffer'),
    toBuffer = require('arraybuffer-to-buffer'),
    pool = require('ndarray-scratch');

var samples = require('./samples.js'),
    randomUtils = require('./random.js'),
    laUtils = require('../math/la-utils.js'),
    projections = require('../math/projections.js'),
    visFeatures = require('../visualization/features.js'),
    visMatches = require('../visualization/matches.js'),
    drawFeatures = require('../visualization/features.js').fromRC,
    drawImagePair = require('../visualization/matches.js').drawImagePair,
    drawDetailedMatch = require('../visualization/matches.js').drawDetailedMatches;


//=====================================================
// Image loading utilities
//=====================================================


/**
 *
 * @param {string} path
 * @param {boolean} [isRGB]
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

/**
 *
 * @param {string} resultPath
 * @param {string} sourcePath
 * @param points - ndarray
 * @param [options]
 * @returns {Promise}
 */
exports.visPoints = function(resultPath, sourcePath, points, options){

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
            visFeatures.fromBuffer(ctx, points, 0, 0, ratio);
            return exports.promiseWriteCanvas(resultPath, canv);
        });

};


/**
 *
 * @param {string} path
 * @param {string} img1
 * @param {string} img2
 * @param points1 - ndarray
 * @param points2 - ndarray
 * @param {int[][]} matches
 * @returns {Promise}
 */
exports.visMatches = function(path, img1, img2, points1, points2, matches){

    return Promise.all([
        exports.promiseCanvasImage(img1),
        exports.promiseCanvasImage(img2)
    ]).then(function(results){
        var cam1 = results[0],
            cam2 = results[1],
            canv = new Canvas(),
            config = visMatches.drawImagePair(cam1, cam2, canv, 1500),
            ctx = canv.getContext('2d');
        visMatches.drawMatches(config, ctx, matches, points1, points2);
        return exports.promiseWriteCanvas(path, canv);
    });

};


/**
 * @param {string} path
 * @param {string} img1
 * @param {string} img2
 * @param features1
 * @param features2
 * @param {int[][]} matches
 * @param {Matrix} F
 * @returns {Promise}
 */
exports.visDetailedMatches = function(path, img1, img2, features1, features2, matches, F){

    return Promise.all([
        exports.promiseCanvasImage(img1),
        exports.promiseCanvasImage(img2)
    ]).then(function(results){

        var cam1 = results[0],
            cam2 = results[1],
            canv = new Canvas(),
            config = drawImagePair(cam1, cam2, canv, 1500),
            ctx = canv.getContext('2d');

        matches.forEach(function(match){
            var i1 = match[0], i2 = match[1];
            var pair = [
                { row: features1.get(i1, 0), col: features1.get(i1, 1) },
                { row: features2.get(i2, 0), col: features2.get(i2, 1) }
            ];
            drawDetailedMatch(ctx, config, F, pair, randomUtils.genRGBString(), cam1, cam2);
        });

        return exports.promiseWriteCanvas(path, canv);

    });

};


/**
 *
 * @param path
 * @returns Promise
 */
exports.promiseArrayBuffer = function(path){
    return new Promise(function(resolve, reject){
        fs.readFile(path, function(err, data){
            if (err) {
                reject();
            }
            else {
                resolve(toArrayBuffer(data));
            }
        });
    });
};


/**
 *
 * @param {String} path
 * @param {ArrayBuffer} buffer
 * @returns Promise
 */
exports.promiseSaveArrayBuffer = function(path, buffer){
    return exports.promiseWriteFile(path, toBuffer(buffer));
};


/**
 *
 * @param {string} path
 * @param {SparseMatrix} sparse
 * @returns {Promise}
 */
exports.promiseSaveSparse = function(path, sparse){
    var buffer = pool.malloc([sparse.rows, sparse.cols]);
    sparse.iter(function(r,c,v){
        buffer.set(r, c, 255);
    });
    return exports.promiseSaveNdarray(path, buffer);
};