'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var bundler = require('../src/math/bundler.js'),
    sample = require('../src/utils/samples.js'),
    projections = require('../src/math/projections.js'),
    testUtils = require('../src/utils/testing.js'),
    cord = require('../src/utils/cord.js'),
    estimateFmatrix = require('../src/webregister/eightpoint.js');


function testCam(i1, i2){

    var matches = sample.getRawMatches(i1, i2),
        data = sample.getTwoView(i1, i2),
        F = projections.getFundamentalMatrix(data.R1, data.t1, data.f1, data.cam1, data.R2, data.t2, data.f2, data.cam2),
        features1 = sample.getFeatures(i1),
        features2 = sample.getFeatures(i2),
        metadata = {
            features1: features1,
            features2: features2,
            cam1: data.cam1,
            cam2: data.cam2
        };

    var results = estimateFmatrix(matches, metadata);
    var estF = results.F;
    var dataset = _.sample(matches, 100);

    return Promise.all([
        testUtils.promiseVisualEpipolar('/home/sheep/Code/est-fmatrix-refer.png', i1, i2, F),
        testUtils.promiseVisualEpipolar('/home/sheep/Code/est-fmatrix-est.png', i1, i2, estF),
        testUtils.promiseDetailedMatches('/home/sheep/Code/est-fmatrix-detail-refer.png', i1, i2, dataset, F),
        testUtils.promiseDetailedMatches('/home/sheep/Code/est-fmatrix-detail-est.png', i1, i2, dataset, estF)

    ]);

}

testCam(5,9);