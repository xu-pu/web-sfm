'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var bundler = require('../src/math/bundler.js'),
    sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    dlt = require('../src/webregister/estimate-projection.js');

function testCam(i){

    var cloud = sample.getViewSparse(i),
        data = sample.getView(i);

    var reference = cloud.map(function(track){
            return track.x;
        });

    var dataset = _.sample(cloud, 100),
        selected = dataset.map(function(track){
            return track.x;
        }),
        points = dataset.map(function(track){
            return track.X;
        }),
        pairs = dataset.map(function(track){
            var rc = track.x;
            return {
                X: track.X,
                x: Vector.create(cord.RCtoImg(rc.row, rc.col, data.cam))
            };
        });

    var estPro = dlt(pairs);

    var estimated = points.map(function(X){
        return cord.img2RT(estPro.x(X), data.cam.height);
    });

    var reprojected = cloud.map(function(track){
        var X = track.X;
        return cord.img2RT(estPro.x(X), data.cam.height);
    });

    return Promise.all([
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-refer.png', i, reference),
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-refer-reprojected.png', i, reprojected),
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-dataset.png', i, selected),
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-est.png', i, estimated)
    ]);

}

testCam(8);

