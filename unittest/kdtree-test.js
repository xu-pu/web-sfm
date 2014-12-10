'use strict';

var _ = require('underscore'),
    assert = require('assert');

var kdtree = require('../src/webmatcher/kd-tree.js'),
    ann = require('../src/webmatcher/search-ann.js'),
    samples = require('../src/utils/samples.js'),
    genRamdom = require('../src/utils/random.js'),
    laUtils = require('../src/math/la-utils.js');

var SAMPLE_SIZE = 100;

describe('Kd-Tree', function(){

    var tree,
        target = genRamdom.getRandomFeature(),
        targetNN,
        minDist = Infinity;

    var dataset = _.range(SAMPLE_SIZE).map(function(){
        var sample = genRamdom.getRandomFeature(),
            dist = laUtils.getFeatureDistance(target, sample);
        if (dist < minDist) {
            minDist = dist;
            targetNN = sample;
        }
        return sample;
    });


    describe('#initTree', function(){

        it('should create kdtree from features', function(){
            tree = kdtree.initTree(dataset);
        });

    });


    describe('#findLeaf', function(){

        it('should find the exact leaf which contain the feature if it exists in the kd-tree', function(){
            _.range(100).forEach(function(){
                var features = tree.features;
                var index = Math.floor(features.length * Math.random());
                var feature = features[index];
                var found = tree.findLeaf(feature).leaf;
                assert.strictEqual(found, index);
            });
        });

    });


    describe('#searchNN', function(){

        it('should found the exact NN of target (a.k.a targetNN)', function(){
            var nnResult = ann.searchNN(tree, target);
            var match = tree.features[nnResult.optimal.feature];
            assert.strictEqual(targetNN, match);
        });

    });


    describe('#searchANN', function(){

        it('should find a NN within the tolerated error range', function(){
            var ANN_THRESHOLD = 0.05;
            var TOLERATED_ERROR = minDist * ( 1 + ANN_THRESHOLD );
            var annResult = ann.searchANN(tree, target, ANN_THRESHOLD);
            assert(
                annResult.optimal.dist < TOLERATED_ERROR,
                'min: ' + minDist + ', ANN: '+ annResult.optimal.dist
            );
        });

    });


});