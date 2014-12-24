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


//=====================================================
// Image loading utilities
//=====================================================


/**
 *
 * @param {string} path
 * @returns {Promise}
 */
module.exports.promiseImage = function(path){
    return new Promise(function(resolve, reject){
        getPixels(path, function(err, img){
            console.log('image loaded');
            resolve(grayscale(img));
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
