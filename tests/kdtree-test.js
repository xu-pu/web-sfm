'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var kdtree = require('../src/webmatcher/kd-tree.js'),
    ann = require('../src/webmatcher/search-ann.js'),
    matching = require('../src/webmatcher/feature-matching.js'),
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

    var nnResult = ann.searchNN(tr, target, 2);
    var annResult = ann.searchANN(tr, target, 2, 0.05);

    console.log();

}

testRandomSample();