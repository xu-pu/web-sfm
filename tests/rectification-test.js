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
        R1new = RR1.x(R1), t1new = RR1.x(t1),
        R2new = RR2.x(R2), t2new = RR2.x(t2);

    return Promise.all([
        samples.promiseCanvasImage(index1),
        samples.promiseCanvasImage(index2)
    ]).then(function(results){
        var img1 = results[0],
            img2 = results[1],
            width1 = img1.width, height1 = img1.height,
            width2 = img2.width, height2 = img2.height,
            K1 = projections.getCalibrationMatrix(f1, width1, height1),
            K2 = projections.getCalibrationMatrix(f2, width2, height2);

//        var H1 = K1.x(rotate(Math.PI/6, Math.PI/6, 0)).x(K1.inverse()),
//            H2 = K2.x(rotate(Math.PI/8, Math.PI/6, Math.PI/5)).x(K2.inverse());

        var H1 = K1.x(RR1).x(K1.inverse()),
            H2 = K2.x(RR2).x(K2.inverse());

//        testUtils.promiseVisualEpipolar('/home/sheep/Code/calibrated-epipolar.png', index1, index2, F);


        return testUtils.promiseVisualHomographyPiar('/home/sheep/Code/homopair.png', index1, index2, H1, H2);

    });

}

function rectificationTest(i1, i2){

    var width = 3008, height = 2000,
        f1 = samples.getCamera(i1).focal,
        f2 = samples.getCamera(i2).focal,
        cam = { width: width, height: height },
        R1 = rotate(0, Math.PI/6, 0),
        R2 = rotate(0, Math.PI/6, 0),
        T1 = Vector.create([0,0,0]),
        T2 = Vector.create([20,20,20]),
        t1 = R1.x(T1).x(-1),
        t2 = R2.x(T2).x(-1);

    var results = rectification(R1, R2, t1, t2, f1, f2);
    var RR1 = results[0],
        RR2 = results[1],
        R1new = RR1.x(R1), t1new = RR1.x(t1),
        R2new = RR2.x(R2), t2new = RR2.x(t2);

    //console.log(R1new);
    //console.log(t1new);
    //console.log(R2new);
    //console.log(t2new);


    var F = projections.getFundamentalMatrix(R1, t1, f1, cam, R2, t2, f2, cam),
        FF = projections.getFundamentalMatrix(R1new, t1new, f1, cam, R2new, t2new, f2, cam);

    testUtils.promiseVisualEpipolar('/home/sheep/Code/epipolar-line-before.png', i1, i2, F);
    testUtils.promiseVisualEpipolar('/home/sheep/Code/epipolar-line-rectified.png', i1, i2, FF);

}

rectificationTest(6,7);

//testPair(6,7);