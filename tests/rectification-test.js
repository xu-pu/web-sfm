'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
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

        var H1 = normalizeMatrix(K1.x(RR1).x(K1.inverse())),
            H2 = normalizeMatrix(K2.x(RR2).x(K2.inverse()));

        console.log(RR1.x(RR1.transpose()));
        console.log(RR2.x(RR2.transpose()));

        var F = projections.getFundamentalMatrix(R1, t1, f1, img1, R2, t2, f2, img2);
        var FF = projections.getFundamentalMatrix(R1new, t1new, f1, img1, R2new, t2new, f2, img2);

        var FFF = normalizeMatrix(H1.transpose().inverse().x(F).x(H2.inverse()));

        testUtils.promiseVisualEpipolar('/home/sheep/Code/before-rect.png', index1, index2, F);
        testUtils.promiseVisualEpipolar('/home/sheep/Code/after-rect.png', index1, index2, FF);
        testUtils.promiseVisualEpipolar('/home/sheep/Code/after-rect-homo.png', index1, index2, FFF);

        return testUtils.promiseVisualHomographyPiar('/home/sheep/Code/result.png', index1, index2, H1, H2, FF);

    });

}


function normalizeMatrix(m){
    var modulus = Vector.create(_.flatten(m.elements)).modulus();
    return m.x(1/modulus);
}

//rectificationTest(6,7);

testPair(18, 22);