'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Promise = require('promise');

var projections = require('../src/math/projections.js'),
    samples = require('../src/utils/samples.js'),
    cord = require('../src/utils/cord.js'),
    testUtils = require('../src/utils/testing.js'),
    eightpoint = require('../src/webregister/eightpoint.js'),
    estimateFmatrix = require('../src/webregister/estimate-fmatrix.js'),
    fmatrixError = eightpoint.fundamentalMatrixError;

function testPair(i1, i2){

    var THRESHOLD = 1,
        data = samples.getTwoView(i1, i2),
        features1 = samples.getFeatures(i1),
        features2 = samples.getFeatures(i2),
        fmatrix = projections.getFundamentalMatrix(data.R1, data.t1, data.f1, data.cam1, data.R2, data.t2, data.f2, data.cam2),
        metadata = {
            features1: features1,
            features2: features2,
            cam1: data.cam1, cam2: data.cam2
        };

    var matches = samples.getRawMatches(i1, i2),
        dataset = matches.map(function(match){
            var fi1 = match[0], fi2 = match[1],
                f1 = features1[fi1], f2 = features2[fi2];
            return {
                x1: Vector.create(cord.featureToImg(f1)),
                x2: Vector.create(cord.featureToImg(f2))
            };
        }),
        filtered = dataset.filter(function(match){
            return fmatrixError(fmatrix, match) < THRESHOLD;
        });


    console.log(filtered.length + '/' + dataset.length + ' left.');

    var sampleSet = _.sample(filtered, 300);
    var FF = estimateFmatrix(sampleSet, metadata);
    var visualSet = _.sample(matches, 100);

    console.log(FF);

    return Promise.all([
        testUtils.promiseDetailedMatches('/home/sheep/Code/svd-estimated.png', i1, i2, visualSet, FF),
        testUtils.promiseDetailedMatches('/home/sheep/Code/svd-reference.png', i1, i2, visualSet)
    ]);

}

testPair(3,4);