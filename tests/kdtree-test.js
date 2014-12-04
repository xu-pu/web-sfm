'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var kdtree = require('../src/webmatcher/kd-tree.js'),
    searchNN = require('../src/webmatcher/search-nn.js'),
    matching = require('../src/webmatcher/feature-matching.js'),
    matchTree = require('../src/webmatcher/kdtree-matching.js'),
    samples = require('../src/utils/samples.js'),
    genRamdom = require('../src/utils/random.js');


function testRandomSample(){

    var SAMPLE_SIZE = 100;

    var target = genRamdom.getRandomFeature(),
        reference, minDist = Infinity;

    var dataset = _.range(SAMPLE_SIZE).map(function(){

        var sample = genRamdom.getRandomFeature(),
            dist = matching.getFeatureDistance(target, sample);

        if (dist < minDist) {
            minDist = dist;
            reference = sample;
        }

        return sample;

    });

    var tr = kdtree.initTree(dataset);

    var result = searchNN(tr, target, 2);

    console.log();

}

testRandomSample();