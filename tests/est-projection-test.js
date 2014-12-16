'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    estimateProjection = require('../src/webregister/estimate-projection.js');

function testCam(i){

    var cloud = sample.getViewSparse(i);

    var dataset = cloud.map(function(track){
        return {
            X: track.X,
            x: cord.feature2img(track.x)
        };
    });

    var estPro = estimateProjection(dataset);

    var estimated = cloud.map(function(track){
        return track.x;
    });

    var reprojected = cloud.map(function(track){
        var X = track.X;
        return cord.img2RC(estPro.x(X));
    });

    return Promise.all([
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-refer-reprojected.png', i, reprojected),
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-est.png', i, estimated)
    ]);

}

testCam(33);

