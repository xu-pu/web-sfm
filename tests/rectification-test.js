'use strict';

var Promise = require('promise'),
    saveimage = require('save-pixels'),
    grayscale = require('luminance'),
    fs = require('fs'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var samples = require('../src/utils/samples.js');
var homography = require('../src/webmvs/homography.js');
var rectification = require('../src/webmvs/rectification.js');

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

    //var rotations = rectification(R1, R2, t1, t2, f1, f2);

    var H1 = Matrix.I(3), H2 = Matrix.I(3);

    /*
    return Promise.all([
        samples.promiseImage(index1),
        samples.promiseImage(index2)
    ]).then(function(results){
        var img1 = results[0],
            img2 = results[1];
        var stream1 = fs.createWriteStream('/home/sheep/Code/writetest1.png');
        var stream2 = fs.createWriteStream('/home/sheep/Code/writetest2.png');
        saveimage(homography(img1, H1), 'png').pipe(stream1);
        saveimage(homography(img2, H2), 'png').pipe(stream2);
    });
    */


}

function showRelative(r1, r2, t1, t2){
    r1 = Matrix.create(r1);
    r2 = Matrix.create(r2);
    t1 = Vector.create(t1);
    t2 = Vector.create(t2);
    var R = r1.inverse().multiply(r2);
    var t = t2.subtract(t1);
    console.log(R.elements);
    console.log(t.elements);
}


testPair(1,10);