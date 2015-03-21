var fs = require('fs'),
    ndarray = require('ndarray'),
    halldemo = require('../src/utils/demo-loader.js').halldemo,
    toArrayBuffer = require('buffer-to-arraybuffer'),
    toBuffer = require('arraybuffer-to-buffer'),
    testUtils = require('../src/utils/test-utils.js'),
    unpack = require('ndarray-unpack'),
    kdtree = require('../src/webmatcher/kd-tree.js');

halldemo.promiseVectorBuffer(4).then(function(buffer){
    var length = buffer.shape[0];
    //var last = buffer.pick(length-1, null);
    //console.log(unpack(last).join(','));
    var tree = kdtree.initTree(buffer);
    var vector = buffer.pick(1776, null);
    var l = tree.findLeaf(vector);
    console.log(l.leaf);
});