'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var sample = require('../src/utils/samples.js'),
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
                return cord.img2RC(x);
            });
            return testUtils.promiseVisualPoints('/home/sheep/Code/projection-test.png', index, points);
        });

}


function testCamDense(index){

    var data = sample.getView(index),
        cloud = sample.getViewDense(index),
        R = data.R,
        t = data.t,
        focal = data.f;

    return sample.promiseCanvasImage(index)
        .then(function(img){
            var projector = projections.getProjectionMatrix(R, t, focal, img.width, img.height);
            var points = cloud.map(function(p){
                var x = projector.x(p);
                return cord.img2RC(x);
            });
            return testUtils.promiseVisualPoints('/home/sheep/Code/projection-test.png', index, points);
        });

}

function testVisiable(index){

    var data = sample.getView(index),
        R = data.R,
        t = data.t,
        focal = data.f,
        cloud = sample.getViewSparse(index);

    return sample.promiseCanvasImage(index)
        .then(function(img){
            var projector = projections.getProjectionMatrix(R, t, focal, img.width, img.height),
                points = cloud.map(function(pair){
                    var X = Vector.create([pair.point[0], pair.point[1], pair.point[2], 1]);
                    var x = projector.x(X);
                    return cord.img2RC(x);
                }),
                reference = cloud.map(function(pair){
                    return pair.feature;
                });
            return Promise.all([
                testUtils.promiseVisualPoints('/home/sheep/Code/projection-visiable-test.png', index, points),
                testUtils.promiseVisualPoints('/home/sheep/Code/projection-visiable-reference.png', index, reference)
            ]);
        });

}

//testVisiable(20);

//testCam(3);

testCamDense(33);