'use strict';

var kdtree = require('../src/webregister/kd-tree.js'),
    searchNN = require('../src/webregister/nn-search.js'),
    matchTree = require('../src/webregister/kdtree-matching.js'),
    samples = require('../src/utils/samples.js');


function constructTree(i){
    var features = samples.getFeatures(i);
    var root = kdtree.initTree(features);
    console.log('kdtree generated');
    var target = features[10];
    var result = searchNN(root, target, 2);
    console.log(result);
}

function matchTest(i1, i2){
    var features1 = samples.getFeatures(i1),
        features2 = samples.getFeatures(i2);
    matchTree(features1, features2);
}

//constructTree(8);

matchTest(1,2);