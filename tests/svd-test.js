'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Promise = require('promise');

var projections = require('../src/math/projections.js'),
    samples = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    eightpoint = require('../src/webregister/eightpoint.js'),
    estimateFmatrix = require('../src/webregister/estimate-fmatrix.js'),
    fmatrixError = eightpoint.fundamentalMatrixError;

function testPair(i1, i2){
    var THRESHOLD = 5,
        data = samples.getTwoView(i1, i2),
        matches = samples.getRawMatches(i1, i2),
        features1 = samples.getFeatures(i1),
        features2 = samples.getFeatures(i2),
        fmatrix = projections.getFundamentalMatrix(data.R1, data.t1, data.f1, data.cam1, data.R2, data.t2, data.f2, data.cam2),
        metadata = {
            features1: features1,
            features2: features2,
            cam1: data.cam1, cam2: data.cam2
        },
        filtered = matches.filter(function(match){
            return fmatrixError(fmatrix, match, metadata) < THRESHOLD;
        });

    console.log(filtered.length + '/' + matches.length + ' left.');

    var sampleSet = _.sample(filtered, 100);
    var FF = estimateFmatrix(sampleSet, metadata);

    console.log(FF);

    return Promise.all([
        testUtils.promiseDetailedMatches('/home/sheep/Code/svd-estimated.png', i1, i2, sampleSet, FF),
        testUtils.promiseDetailedMatches('/home/sheep/Code/svd-reference.png', i1, i2, sampleSet)
    ]);

}

testPair(1,2);