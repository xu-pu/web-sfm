'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var sample = require('../src/utils/samples.js'),
    projections = require('../src/math/projections.js'),
    testUtils = require('../src/utils/testing.js'),
    cord = require('../src/utils/cord.js'),
    estHomography = require('../src/webregister/estimate-infinite-homography.js'),
    estFmatrix = require('../src/webregister/estimate-fmatrix.js');


function testPair(i1, i2){

    var matches = sample.getRawMatches(i1, i2),
        data = sample.getTwoView(i1, i2),
        features1 = sample.getFeatures(i1),
        features2 = sample.getFeatures(i2),
        metadata = {
            features1: features1,
            features2: features2,
            cam1: data.cam1,
            cam2: data.cam2
        };

    var result = estFmatrix(matches, metadata);

    var H = estHomography(result.dataset, metadata);

}

testPair(3,4);