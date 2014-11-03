'use strict';

var kdtree = require('../src/webregister/kd-tree.js'),
    Root = kdtree.Root,
    samples = require('../src/utils/samples.js');


function constructTree(i){
    var features = samples.getFeatures(i);
    var root = new Root(features);
}

constructTree(8);