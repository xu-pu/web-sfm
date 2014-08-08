var Promise = require('promise'),
    grayscale = require('luminance'),
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
        cam2 = samples.getCamera(index2);
    var r1 = cam1.R,
        r2 = cam2.R,
        t1 = cam1.t,
        t2 = cam2.t,
        f1 = cam1.focal,
        f2 = cam2.focal;

    showRelative(r1, r2, t1, t2);

    var rotations = rectification(r1, r2, t1, t2, f1, f2);
    console.log(rotations[0].elements);
    console.log(rotations[1].elements);

    Promise.all([
        samples.promiseImage(index1),
        samples.promiseImage(index2)
    ]).then(function(results){
        var img1 = results[0],
            img2 = results[1];
        samples.showGrayscale(homography(img1, rotations[0], f1));
        samples.showGrayscale(homography(img2, rotations[1], f2));
        //samples.showGrayscale(homography(img1, testRotation, f1));
        //samples.showGrayscale(homography(img2, testRotation, f2));
    });
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