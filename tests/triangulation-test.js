'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var bundler = require('../src/math/bundler.js'),
    sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    cord = require('../src/utils/cord.js'),
    triangulation = require('../src/webregister/triangulation.js');


function testPair(i1, i2){

    var cloud = sample.getTwoViewSparse(i1, i2),
        data = sample.getTwoView(i1, i2);

    var dataset = _.sample(cloud, 500),
        selected1 = dataset.map(function(track){
            return track.x1;
        }),
        selected2 = dataset.map(function(track){
            return track.x2;
        });

    var estimated = dataset.map(function(track){
            var rc1 = track.x1,
                x1 = Vector.create(cord.RCtoImg(rc1.row, rc1.col, data.cam1)),
                rc2 = track.x2,
                x2 = Vector.create(cord.RCtoImg(rc2.row, rc2.col, data.cam2));
            return triangulation(data.P1, data.P2, x1, x2);
        }),
        reprojected1 = estimated.map(function(X){
            return cord.img2RT(data.P1.x(X), data.cam1.height);
        }),
        reprojected2 = estimated.map(function(X){
            return cord.img2RT(data.P2.x(X), data.cam2.height);
        });


    return Promise.all([
        testUtils.promiseVisualPoints('/home/sheep/Code/triangulation-1-refer.png', i1, selected1),
        testUtils.promiseVisualPoints('/home/sheep/Code/triangulation-1-reprojected.png', i1, reprojected1),
        testUtils.promiseVisualPoints('/home/sheep/Code/triangulation-2-refer.png', i2, selected2),
        testUtils.promiseVisualPoints('/home/sheep/Code/triangulation-2-reprojected.png', i2, reprojected2)
    ]);

}

testPair(8,10);
