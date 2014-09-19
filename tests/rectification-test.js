'use strict';

var Promise = require('promise'),
    grayscale = require('luminance'),
    fs = require('fs'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var samples = require('../src/utils/samples.js'),
    homography = require('../src/webmvs/homography.js'),
    rectification = require('../src/webmvs/rectification.js'),
    bundler = require('../src/math/bundler.js');

var TEST_ANGEL = Math.PI/6;

var testRotation = Matrix.create([
    [Math.cos(TEST_ANGEL), Math.sin(TEST_ANGEL), 0],
    [-Math.sin(TEST_ANGEL), Math.cos(TEST_ANGEL), 0],
    [0,0,1]
]);

function testPair(index1, index2){

    var cam1 = samples.getCamera(index1),
        cam2 = samples.getCamera(index2),
        R1 = Matrix.create(cam1.R),
        R2 = Matrix.create(cam2.R),
        t1 = Vector.create(cam1.t),
        t2 = Vector.create(cam2.t),
        f1 = cam1.focal,
        f2 = cam2.focal;

    var rotations = rectification(R1, R2, t1, t2, f1, f2);
    var RR1 = rotations[0],
        RR2 = rotations[1];

//    console.log(RR1.x(RR1.transpose()));
//    console.log(RR2.x(RR2.transpose()));

    var DR1 = RR1.x(R1.transpose()),
        DR2 = RR2.x(R2.transpose());

    return Promise.all([
        samples.promiseImage(index1),
        samples.promiseImage(index2)
    ]).then(function(results){
        var img1 = results[0],
            img2 = results[1];
        var width1 = img1.shape[1], height1 = img1.shape[0],
            width2 = img2.shape[1], height2 = img2.shape[0];
        var K1 = bundler.getCalibrationMatrix(f1, width1, height1),
            K2 = bundler.getCalibrationMatrix(f2, width2, height2);
        var H1,
            H2;

        var stream1 = fs.createWriteStream('/home/sheep/Code/writetest1.png');
        var stream2 = fs.createWriteStream('/home/sheep/Code/writetest2.png');
    });



}

testPair(1,10);