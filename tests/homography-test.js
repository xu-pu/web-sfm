'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    fs = require('fs'),
    Canvas = require('canvas'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var samples = require('../src/utils/samples.js'),
    homography = require('../src/webmvs/homography.js'),
    rectification = require('../src/webmvs/rectification.js'),
    testUtils = require('../src/utils/testing.js'),
    drawHomography = require('../src/visualization/drawHomography.js'),
    projections = require('../src/math/projections.js'),
    rotate = require('../src/math/geometry-utils.js');

function testRotateMotion(i){

    var width = 3008, height = 2000,
        cam = samples.getCamera(i),
        R = Matrix.create(cam.R),
        t = Matrix.create(cam.t),
        focal = cam.focal,
        K = projections.getCalibrationMatrix(focal, width, height);

    cam.width = width;
    cam.height = height;

    var RATIO = 0.25,
        ROTATION = Math.PI/4,
        STEPS = 10,
        STEP = ROTATION/STEPS;

    return samples
        .promiseImage(i)
        .then(function(img){
            return Promise.all(_.range(STEPS+1).map(function(index){

                var rotation = rotate(-index*STEP,index*STEP,index*STEP),
                    H = K.x(rotation).x(K.inverse()),
                    w = Math.round(width*RATIO),
                    h = Math.round(height*RATIO),
                    canv = new Canvas(w, h),
                    ctx = canv.getContext('2d');

                drawHomography(img, H, ctx, 0, 0, RATIO);

                return testUtils.promiseWriteCanvas(canv, '/home/sheep/Code/HomoMotion' + index + '.png');

            }));
        });

}

testRotateMotion(5);