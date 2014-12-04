'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Promise = require('promise');

var kdtree = require('../src/webmatcher/kd-tree.js'),
    searcher = require('../src/webmatcher/search-ann.js'),
    samples = require('../src/utils/samples.js'),
    utils = require('../src/utils/image-conversion.js'),
    cord = require('../src/utils/cord.js');


function testPiar(i1, i2){

    var features1 = samples.getFeatures(i1),
        features2 = samples.getFeatures(i2),
        kdtree1 = kdtree.initTree(features1),
        kdtree2 = kdtree.initTree(features2);

    features1.forEach(function(f1){
        var results = searcher.searchANN(kdtree2, f1, 2, 0.3);
        //var results = searcher.searchNN(kdtree2, f1, 2);
        console.log('one done');
    });


}

testPiar(2,3);