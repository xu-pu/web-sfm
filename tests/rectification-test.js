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


function testPair(index1, index2){

    var data = samples.getTwoView(index1, index2),
        cam1 = data.cam1, cam2 = data.cam2,
        R1 = data.R1, t1 = data.t1, f1 = data.f1,
        R2 = data.R2, t2 = data.t2, f2 = data.f2,
        rotations = rectification(R1, R2, t1, t2, f1, f2),
        RR1 = rotations[0], RR2 = rotations[1];

//    var R1new = RR1.x(R1), t1new = RR1.x(t1),
//        R2new = RR2.x(R2), t2new = RR2.x(t2);

    return Promise.all([
        samples.promiseCanvasImage(index1),
        samples.promiseCanvasImage(index2)
    ]).then(function(results){

        var img1 = results[0],
            img2 = results[1],
            K1 = projections.getCalibrationMatrix(f1, cam1.width, cam1.height),
            K2 = projections.getCalibrationMatrix(f2, cam2.width, cam2.height),
            H1 = normalizeMatrix(K1.x(RR1).x(K1.inverse())),
            H2 = normalizeMatrix(K2.x(RR2).x(K2.inverse())),
            F = projections.getFundamentalMatrix(R1, t1, f1, img1, R2, t2, f2, img2);

//        var FF = projections.getFundamentalMatrix(R1new, t1new, f1, img1, R2new, t2new, f2, img2),
//            FFF = normalizeMatrix(H1.transpose().inverse().x(F).x(H2.inverse()));

        return Promise.all([
            testUtils.promiseVisualEpipolar('/home/sheep/Code/rect-before.png', index1, index2, F),
//            testUtils.promiseVisualEpipolar('/home/sheep/Code/after-rect.png', index1, index2, FF),
//            testUtils.promiseVisualEpipolar('/home/sheep/Code/after-rect-homo.png', index1, index2, FFF),
            testUtils.promiseVisualHomographyPiar('/home/sheep/Code/rect-result.png', index1, index2, H1, H2)
        ]);

    });

}


function normalizeMatrix(m){
    var modulus = Vector.create(_.flatten(m.elements)).modulus();
    return m.x(1/modulus);
}

testPair(11,12);