'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var sample = require('../src/utils/samples.js'),
    halldemo = require('../src/utils/demo-loader.js').halldemo,
    projections = require('../src/math/projections.js'),
    testUtils = require('../src/utils/testing.js'),
    cord = require('../src/utils/cord.js'),
    estFmatrix = require('../src/webregister/estimate-fmatrix.js');


function testCam(i1, i2){

    var matches = halldemo.getRawMatches(i1, i2).matches,
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

    var results = estFmatrix(matches, metadata);
    var estF = results.F;
    var dataset = _.sample(results.dataset, 100);

    return Promise.all([
        halldemo.promiseSaveRobustMatches({ from: i1, to: i2, matches: results.dataset, F: estF.elements }),
        testUtils.visDetailedMatches('/home/sheep/Code/est-fmatrix-detail-refer.png', i1, i2, dataset, F),
        testUtils.visDetailedMatches('/home/sheep/Code/est-fmatrix-detail-est.png'  , i1, i2, dataset, estF)
    ]);

}

//console.log(halldemo.getRobustMatches(1,3).F);

//testCam(7,9);