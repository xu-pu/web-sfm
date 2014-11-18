'use strict';

var DEMO_BASE = '/home/sheep/Code/Project/web-sfm/demo/Hall-Demo';

var _ = require('underscore'),
    Promise = require('promise'),
    getPixels = require('get-pixels'),
    grayscale = require('luminance'),
    imgshow = require('ndarray-imshow'),
    Image = require('canvas').Image,
    fs = require('fs'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var toRGB = require('../websift/gray2rgb.js');
var bundler = require(DEMO_BASE + '/bundler/bundler.json');

//==============================================

module.exports.promiseImage = promiseImage;
module.exports.getCamera = getCamera;
module.exports.showGrayscale = showGrayscale;
module.exports.getFeatures = getFeatures;
module.exports.promiseCanvasImage = promiseCanvasImage;
module.exports.getRawMatches = getRawMatches;
module.exports.bundler = bundler;
module.exports.cameras = bundler.cameras;
module.exports.sparse = bundler.points;

//==============================================

/**
 * A view pair for processing
 * @param {number} i1
 * @param {number} i2
 * @returns {{R1, R2, t1, t2, f1: number, f2: number, cam1: Camera, cam2: Camera}}
 */
module.exports.getTwoView = function(i1, i2){
    var cam1 = getCamera(i1),
        cam2 = getCamera(i2),
        cam = { width: 3008, height: 2000 };
    return {
        R1: Matrix.create(cam1.R),
        R2: Matrix.create(cam2.R),
        t1: Vector.create(cam1.t),
        t2: Vector.create(cam2.t),
        f1: cam1.focal,
        f2: cam2.focal,
        cam1: cam,
        cam2: cam
    };
};

//==============================================

function getFeatures(index){
    var siftPath = DEMO_BASE + '/sift.json/' + getFullname(index) + '.json';
    return require(siftPath).features;
}

function getImagePath(index){
    return DEMO_BASE + '/images/' + getFullname(index) + '.jpg';
}

function getFullname(index){
    var name = String(index),
        prefixLength = 8-name.length;
    for (var i= 0; i<prefixLength; i++) {
        name = '0' + name;
    }
    return name;
}


function getCamera(index){
    return bundler.cameras[index];
}

function promiseImage(index){
    return new Promise(function(resolve, reject){
        getPixels(getImagePath(index), function(err, img){
            console.log('image loaded');
            resolve(grayscale(img));
        });
    });
}

function promiseCanvasImage(index){
    return new Promise(function(resolve, reject){
        fs.readFile(getImagePath(index), function(err, buffer){
            if (err) {
                console.log('load failed');
                reject(err);
            }
            var img = new Image;
            img.src = buffer;
            resolve(img);
        });
    });
}

function showGrayscale(gray){
    imgshow(toRGB(gray));
}

function getRawMatches(index1, index2){
    var path;
    if (index1 > index2) {
        path = DEMO_BASE + '/raw-match/' + getFullname(index2) + '.jpg&' + getFullname(index1) + '.jpg.json';
    }
    else if (index1 < index2) {
        path = DEMO_BASE + '/raw-match/' + getFullname(index1) + '.jpg&' + getFullname(index2) + '.jpg.json';
    }
    else {
        throw "can not match itself";
    }
    return require(path);
}