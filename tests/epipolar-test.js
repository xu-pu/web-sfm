'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Canvas = require('canvas');

var bundler = require('../src/math/bundler.js'),
    sample = require('../src/utils/samples.js'),
    drawFeatures = require('../src/visualization/drawFeatures.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    FError = require('../src/webregister/eightpoint.js').fundamentalMatrixError,
    rectification = require('../src/webmvs/rectification.js');


function drawFMatrixFilter(i1, i2){

    var width = 3008, height = 2000,
        cam1 = sample.getCamera(i1),
        cam2 = sample.getCamera(i2),
        R1 = Matrix.create(cam1.R),
        R2 = Matrix.create(cam2.R),
        t1 = Vector.create(cam1.t),
        t2 = Vector.create(cam2.t);

    cam1.width = width;
    cam1.height = height;
    cam2.width = width;
    cam2.height = height;

    var F = projections.getFundamentalMatrix(R1, t1, cam1.focal, cam1, R2, t2, cam2.focal, cam2);

    var features1 = sample.getFeatures(i1),
        features2 = sample.getFeatures(i2),
        matches = sample.getRawMatches(i1, i2),
        metadata = {
            features1: features1,
            features2: features2,
            cam1: cam1,
            cam2: cam2
        };

    var filtered = epiFilter(F, metadata, matches, 0.5);
    console.log(filtered.length + '/' + matches.length + ' , ' + filtered.length/matches.length + ' passed filter.');

    testUtils.promiseVisualMatch('/home/sheep/Code/filter-test.png', i1, i2, filtered);

    testUtils.promiseVisualEpipolar('/home/sheep/Code/calibrated-epipolar.png', i1, i2, F);

}


function drawFMatrix(i1, i2){

    var width = 3008, height = 2000,
        cam1 = sample.getCamera(i1),
        cam2 = sample.getCamera(i2),
        R1 = Matrix.create(cam1.R),
        R2 = Matrix.create(cam2.R),
        t1 = Vector.create(cam1.t),
        t2 = Vector.create(cam2.t);

    cam1.width = width;
    cam1.height = height;
    cam2.width = width;
    cam2.height = height;

    var F = projections.getFundamentalMatrix(R1, t1, cam1.focal, cam1, R2, t2, cam2.focal, cam2);

    testUtils.promiseVisualEpipolar('/home/sheep/Code/epipolar-line-test.png', i1, i2, F);

}


function drawEpipolarRectified(i1, i2){

    var width = 3008, height = 2000,
        cam1 = sample.getCamera(i1),
        cam2 = sample.getCamera(i2),
        f1 = cam1.focal,
        f2 = cam2.focal,
        R1 = Matrix.create(cam1.R),
        R2 = Matrix.create(cam2.R),
        t1 = Vector.create(cam1.t),
        t2 = Vector.create(cam2.t);

    cam1.width = width;
    cam1.height = height;
    cam2.width = width;
    cam2.height = height;

    var results = rectification(R1, R2, t1, t2, f1, f2);
    var RR1 = results[0],
        RR2 = results[1],
        R1new = RR1.x(R1), t1new = RR1.x(t1),
        R2new = RR2.x(R2), t2new = RR2.x(t2);

    var F = projections.getFundamentalMatrix(R1, t1, f1, cam1, R2, t2, f2, cam2),
        FF = projections.getFundamentalMatrix(R1new, t1new, f1, cam1, R2new, t2new, f2, cam2);

    testUtils.promiseVisualEpipolar('/home/sheep/Code/epipolar-line-before.png', i1, i2, F);
    testUtils.promiseVisualEpipolar('/home/sheep/Code/epipolar-line-rectified.png', i1, i2, FF);

}


function epiFilter(F, metadata, matches, threshold){
    return matches.filter(function(match){
        return FError(F, match, metadata) < threshold;
    });
}

//drawFMatrix(2,4);

drawEpipolarRectified(25,27);