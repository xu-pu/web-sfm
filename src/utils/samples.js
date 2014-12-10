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
    cord = require('./cord.js'),
    projections = require('../math/projections.js');

//==============================================

module.exports.promiseImage = promiseImage;
module.exports.showGrayscale = showGrayscale;
module.exports.promiseCanvasImage = promiseCanvasImage;
module.exports.getRawMatches = getRawMatches;
module.exports.bundler = bundler;
module.exports.cameras = bundler.cameras;
module.exports.sparse = bundler.points;

//==============================================

//==============================================

/**
 * A view pair for processing
 * @param {number} i1
 * @param {number} i2
 * @returns {{ R1: Matrix, R2: Matrix, t1: Vector, t2: Vector, f1: number, f2: number, cam1: Camera, cam2: Camera}}
 */
module.exports.getTwoView = function(i1, i2){

    if ( !( _.isNumber(i1) && _.isNumber(i2) ) ) {
        throw "please specify two indexes!";
    }

    var cam1 = exports.getCamera(i1),
        cam2 = exports.getCamera(i2),
        cam = { width: 3008, height: 2000},
        rt1 = cord.getStandardRt(Matrix.create(cam1.R), Vector.create(cam1.t)),
        rt2 = cord.getStandardRt(Matrix.create(cam2.R), Vector.create(cam2.t)),
        R1 = rt1.R, t1 = rt1.t, f1 = cam1.focal,
        R2 = rt2.R, t2 = rt2.t, f2 = cam2.focal,
        P1 = projections.getProjectionMatrix(R1, t1, f1, cam.width, cam.height),
        P2 = projections.getProjectionMatrix(R2, t2, f2, cam.width, cam.height);

    return {
        R1: R1, t1: t1, f1: f1,
        R2: R2, t2: t2, f2: f2,
        cam1: cam, cam2: cam,
        P1: P1, P2: P2
    };
};


/**
 * Get calibrated camera
 * @param {int} i
 * @returns {{ P: Matrix, R: Matrix, t: Vector, f: number, cam: Camera }}
 */
module.exports.getView = function(i){
    var camera = exports.getCamera(i),
        cam = { width: 3008, height: 2000},
        rt = cord.getStandardRt(Matrix.create(camera.R), Vector.create(camera.t)),
        R = rt.R, t = rt.t, f = camera.focal,
        P = projections.getProjectionMatrix(R, t, f, cam.width, cam.height);
    return { P: P, R: R, t: t, f: f, cam: cam };
};


/**
 * Get a sample calibrated camera
 * @param {int} i
 * @returns {CalibratedCamera}
 */
module.exports.getCalibratedCamera = function(i){
    var data = exports.getView(i);
    return {
        R: data.R,
        t: data.t,
        focal: data.f,
        P: data.P,
        width: data.cam.width,
        height: data.cam.height
    };
};


/**
 * Get visible sparse point cloud of one view
 * @param {int} i
 * @returns {{ x: RowCol, X: Vector }[]}
 */
module.exports.getViewSparse = function(i){

    var data = exports.getView(i),
        pointset = [];

    exports.sparse.forEach(function(point){

        var visiable = point.views.some(function(view){
            return view.view === i;
        });

        if (visiable) {
            var p = point.point,
                X = Vector.create([p[0], p[1], p[2], 1]),
                x = data.P.x(X),
                rc = cord.img2RC(x);
            pointset.push({ x: rc, X: X });
        }

    });

    return pointset;

};


/**
 * @param i1
 * @param i2
 * @returns {{ X: Vector, x1: RowCol, x2: RowCol }[]}
 */
module.exports.getTwoViewSparse = function(i1, i2){

    var data = exports.getTwoView(i1, i2);

    return exports.sparse.filter(function(point){

        var visiableIn1 = point.views.some(function(view){
            return view.view === i1;
        });

        var visiableIn2 = point.views.some(function(view){
            return view.view === i2;
        });

        return visiableIn1 && visiableIn2;

    }).map(function(point){
        var p = point.point,
            X = Vector.create([p[0], p[1], p[2], 1]),
            x1 = data.P1.x(X),
            x2 = data.P2.x(X);
        return {
            X: X,
            x1: cord.img2RC(x1),
            x2: cord.img2RC(x2)
        };
    });

};


//==============================================
// Raw data
//==============================================


/**
 * @param index
 * @returns {Feature[]}
 */
module.exports.getFeatures = function(index){
    var siftPath = DEMO_BASE + '/sift.json/' + getFullname(index) + '.json';
    return require(siftPath).features;
};


/**
 * @param index
 * @returns {BundlerCamera}
 */
module.exports.getCamera = function(index){
    return exports.cameras[index];
};


//==============================================

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