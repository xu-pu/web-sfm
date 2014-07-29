var Promise = require('promise'),
    grayscale = require('luminance'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var samples = require('../src/utils/samples.js');
var homography = require('../src/webmvs/homography.js');
var rectification = require('../src/webmvs/rectification.js');

var cam1 = samples.getCamera(0),
    cam2 = samples.getCamera(1);

var r1 = cam1.R,
    r2 = cam2.R,
    t1 = cam1.t,
    t2 = cam2.t,
    f1 = cam1.focal,
    f2 = cam2.focal;

var rotations = rectification(r1, r2, t1, t2);

//var identityRotation = Matrix.I(3);

Promise.all([
    samples.promiseImage(0),
    samples.promiseImage(1)
]).then(function(results){
    var img1 = results[0],
        img2 = results[1];
    samples.showGrayscale(homography(img1, rotations[0], f1));
    samples.showGrayscale(homography(img2, rotations[1], f2));
//    samples.showGrayscale(homography(img1, identityRotation, f1));
//    samples.showGrayscale(homography(img2, identityRotation, f2));
});

console.log(rotations[0].elements);
console.log(rotations[1].elements);