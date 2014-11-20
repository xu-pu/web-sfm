'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var bundler = require('../src/math/bundler.js'),
    sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js');

function testCam(index){

    var data = sample.getView(index),
        R = data.R,
        t = data.t,
        focal = data.f;

    return sample.promiseCanvasImage(index)
        .then(function(img){
            var projector = projections.getProjectionMatrix(R, t, focal, img.width, img.height);
            var points = sample.sparse.map(function(p){
                var X = Vector.create([p.point[0], p.point[1], p.point[2], 1]);
                var x = projector.x(X);
                return cord.img2RT(x, img.height);
            });
            return testUtils.promiseVisualPoints('/home/sheep/Code/projection-test.png', index, points);
        });

}

testCam(50);