'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Promise = require('promise');

var matcher = require('../src/webmatcher/match-feature.js'),
    samples = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    cord = require('../src/utils/cord.js');




function testPiar(i1, i2){

    var features1 = samples.getFeatures(i1),
        features2 = samples.getFeatures(i2);

    var matches = matcher(features1, features2);

    return Promise.all([
        testUtils.promiseVisualMatch('/home/sheep/Code/matching-ann.png', i1, i2, matches)
    ]);

}

testPiar(2,3);