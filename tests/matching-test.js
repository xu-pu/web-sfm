'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Promise = require('promise');

var halldemo = require('../src/utils/demo-loader.js').halldemo,
    matcher = require('../src/webmatcher/match-feature.js'),
    samples = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    cord = require('../src/utils/cord.js');

function testPiar(i1, i2){

    return Promise.all([
        halldemo.promiseVectorBuffer(i1),
        halldemo.promiseVectorBuffer(i2)
    ]).then(function(results){

        var features1 = results[0],
            features2 = results[1];

        var matches = matcher(features1, features2);

        return Promise.all([
            testUtils.promiseVisualMatch('/home/sheep/Code/matching-ann.png', i1, i2, matches)
        ]);

    });


}

testPiar(2,4);