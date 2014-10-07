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
    FError = require('../src/webregister/eightpoint.js').fundamentalMatrixError;


function testCam(index){

    var cam = sample.getCamera(index),
        Rt = bundler.getStandardRt(Matrix.create(cam.R), Vector.create(cam.t)),
        R = Rt.R,
        t = Rt.t,
        focal = cam.focal;

    return sample
        .promiseCanvasImage(index)
        .then(function(img){
            var projector = projections.getProjectionMatrix(R, t, focal, img.width, img.height);
            var points = sample.sparse.map(function(p){
                var X = Vector.create([p.point[0], p.point[1], p.point[2], 1]);
                var x = projector.x(X);
                return cord.img2RT(x, img.height);
            });
            var canv = new Canvas();
            canv.width = img.width;
            canv.height = img.height;
            var ctx = canv.getContext('2d');
            ctx.drawImage(img, 0, 0);
            drawFeatures(ctx, points, 0, 0, 1, {markSize: 10});
            return testUtils.promiseWriteCanvas(canv, '/home/sheep/Code/geo.png')
        });

}

//testCam(9);

function bundlerTest(){
    var cam = sample.getCamera(3);
    var R = Matrix.create(cam.R);
    var t = Vector.create(cam.t);
    var Rt = bundler.getStandardRt(R,t);
    var o = R.transpose().x(t).x(-1);
    var v1 = toworld(R, t, Vector.create([0,0,1]));
    var v2 = toworld(Rt.R, Rt.t, Vector.create([0,0,1]));

    console.log(v1.subtract(o));
    console.log(v2.subtract(o));

    function toworld(R, t, P){
        return R.transpose().x(P.subtract(t));
    }
}

function drawEpipolarGeometry(i1, i2) {

    var features1, features2, matches, metadata;

    return Promise.all([
        samples.promiseCanvasImage(i1),
        samples.promiseCanvasImage(i2)
    ]).then(function(results){
        features1 = samples.getFeatures(i1);
        features2 = samples.getFeatures(i2);
        matches = samples.getRawMatches(i1, i2);
        metadata = {
            cam1: results[0],
            cam2: results[1],
            features1: features1,
            features2: features2
        };
        return promiseEpipolarVisual('/home/sheep/Code/epipole/'+threshold+'.png',
            results[0], results[1], features1, features2, result.dataset, result.rel);
    });
}

function testEpipolarGeometry(i1, i2){

    var width = 3008, height = 2000,
        cam1 = sample.getCamera(i1),
        cam2 = sample.getCamera(i2),
        R1 = Matrix.create(cam1.R),
        R2 = Matrix.create(cam2.R),
        t1 = Vector.create(cam1.t),
        t2 = Vector.create(cam2.t),
        R = R2.x(R1.transpose()),
        t = t2.subtract(R.x(t1)),
        T = R.transpose().x(t).x(-1),
        Tx = Matrix.create([
            [ 0      , -T.e(3) , T.e(2) ],
            [ T.e(3) , 0       , -T.e(1)],
            [ -t.e(2), t.e(1)  , 0      ]
        ]),
        K1 = projections.getCalibrationMatrix(cam1.focal, width, height),
        K2 = projections.getCalibrationMatrix(cam2.focal, width, height),
        F = K2.transpose().inverse().x(R).x(Tx).x(K1.inverse()),
        modulus = Vector.create(_.flatten(F.elements)).modulus();

    cam1.width = width;
    cam1.height = height;
    cam2.width = width;
    cam2.height = height;

    F = F.x(1/modulus).transpose();

    /*
    var features1 = sample.getFeatures(i1),
        features2 = sample.getFeatures(i2),
        matches = sample.getRawMatches(i1, i2),
        metadata = {
            features1: features1,
            features2: features2,
            cam1: cam1,
            cam2: cam2
        };

    var filtered = epiFilter(F, metadata, matches, 0.1);
    console.log(filtered.length + '/' + matches.length + ' , ' + filtered.length/matches.length + ' passed filter.');

    testUtils.promiseVisualMatch('/home/sheep/Code/filter-test.png', i1, i2, filtered);
*/
    testUtils.promiseVisualEpipolar('/home/sheep/Code/calibrated-epipolar.png', i1, i2, F);

}

function epiFilter(F, metadata, matches, threshold){
    return matches.filter(function(match){
        return FError(F, match, metadata) < threshold;
    });
}


testEpipolarGeometry(2,3);