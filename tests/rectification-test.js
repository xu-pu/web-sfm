'use strict';

var Promise = require('promise'),
    grayscale = require('luminance'),
    fs = require('fs'),
    la = require('sylvester'),
    lena = grayscale(require('lena')),
    Matrix = la.Matrix,
    Vector = la.Vector;

var samples = require('../src/utils/samples.js'),
    homography = require('../src/webmvs/homography.js'),
    rectification = require('../src/webmvs/rectification.js'),
    bundler = require('../src/math/bundler.js'),
    projections = require('../src/math/projections.js'),
    testUtils = require('../src/utils/testing.js'),
    rotate = require('../src/math/rotate.js');

var TEST_ANGEL = Math.PI/6;

var testRotation = Matrix.create([
    [Math.cos(TEST_ANGEL), Math.sin(TEST_ANGEL), 0],
    [-Math.sin(TEST_ANGEL), Math.cos(TEST_ANGEL), 0],
    [0,0,1]
]);

function testPair(index1, index2){

    var cam1 = samples.getCamera(index1),
        cam2 = samples.getCamera(index2),
        Rt1 = bundler.getStandardRt(Matrix.create(cam1.R), Vector.create(cam1.t)),
        Rt2 = bundler.getStandardRt(Matrix.create(cam2.R), Vector.create(cam2.t)),
        R1 = Rt1.R, t1 = Rt1.t, f1 = cam1.focal,
        R2 = Rt2.R, t2 = Rt2.t, f2 = cam2.focal;

    var rotations = rectification(R1, R2, t1, t2, f1, f2);
    var RR1 = rotations[0],
        RR2 = rotations[1],
        DR1 = RR1.x(R1.transpose()),
        DR2 = RR2.x(R2.transpose());

    return Promise.all([
        samples.promiseImage(index1),
        samples.promiseImage(index2)
    ]).then(function(results){
        var img1 = results[0],
            img2 = results[1],
            width1 = img1.shape[1], height1 = img1.shape[0],
            width2 = img2.shape[1], height2 = img2.shape[0],
            K1 = projections.getCalibrationMatrix(f1, width1, height1),
            K2 = projections.getCalibrationMatrix(f2, width2, height2);


        var H1 = K1.x(rotate(Math.PI/8, Math.PI/8, Math.PI/8)).x(K1.inverse()),
            H2 = K2.x(rotate(Math.PI/10, Math.PI/10, 0)).x(K2.inverse());

        return Promise.all([
            testUtils.promiseSaveNdarray(homography(img1, H1), '/home/sheep/Code/writetest1.png'),
            testUtils.promiseSaveNdarray(homography(img2, H2), '/home/sheep/Code/writetest2.png')
        ]);

    });

}

testPair(1,2);