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


var toRGB = require('../websift/gray2rgb.js'),
    bundler = require(DEMO_BASE + '/bundler/bundler.json'),
    bundlerUtils = require('../math/bundler.js'),
    cord = require('./cord.js');

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
        cam = { width: 3008, height: 2000},
        rt1 = bundlerUtils.getStandardRt(Matrix.create(cam1.R), Vector.create(cam1.t)),
        rt2 = bundlerUtils.getStandardRt(Matrix.create(cam2.R), Vector.create(cam2.t));
    return {
        R1: rt1.R, t1: rt1.t, f1: cam1.focal,
        R2: rt2.R, t2: rt2.t, f2: cam2.focal,
        cam1: cam,
        cam2: cam
    };
};


/**
 *
 * @param i
 * @returns {{R, t, f: number, cam: Camera}}
 */
module.exports.getView = function(i){
    var camera = getCamera(i),
        cam = { width: 3008, height: 2000},
        rt = bundlerUtils.getStandardRt(Matrix.create(camera.R), Vector.create(camera.t));
    return {
        R: rt.R,
        t: rt.t,
        f: camera.focal,
        cam: cam
    };
};


/**
 * Get visible sparse point cloud of one view
 * @param {int} i
 * @returns {{ feature: { row: number, col: number }, point: number[] }[]}
 */
module.exports.getViewSparse = function(i){

    var cam = { width: 3008, height: 2000},
        pointset = [];

    exports.sparse.forEach(function(point){


        var targetView;

        var visiable = point.views.some(function(view){
            if (view.view === i) {
                targetView = view;
                return true;
            }
        });

        if (visiable && targetView) {
            pointset.push({
                feature: cord.bundler2RT(targetView.x, targetView.y, cam),
                point: point.point
            });
        }

    });

    return pointset;

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