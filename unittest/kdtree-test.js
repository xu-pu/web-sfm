'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    pool = require('ndarray-scratch');

var kdtree = require('../src/webmatcher/kd-tree.js'),
    matcher = require('../src/webmatcher/matcher.js'),
    samples = require('../src/utils/samples.js'),
    genRamdom = require('../src/utils/random.js'),
    laUtils = require('../src/math/la-utils.js');

var SAMPLE_SIZE = 50;

describe('Kd-Tree', function(){

    var tree,
        vectors = genRamdom.genRandomVectorBuffer(SAMPLE_SIZE, 128),
        targets = pool.clone(vectors);

    _.range(SAMPLE_SIZE).forEach(function(i){
        var cursor1 = vectors.get(i, 10);
        var cursor2 = vectors.get(i, 50);
        var cursor3 = vectors.get(i, 80);
        targets.set(i, 10, cursor1 === 0 ? 1 : cursor1-1);
        targets.set(i, 50, cursor2 === 0 ? 1 : cursor2-1);
        targets.set(i, 80, cursor3 === 0 ? 1 : cursor3-1);
    });

    describe('#initTree', function(){

        it('should create kdtree from features', function(){
            tree = kdtree.initTree(vectors);
        });

    });


    describe('#findLeaf', function(){

        it('should find the exact leaf which contain the feature if it exists in the kd-tree', function(){
            _.range(SAMPLE_SIZE).forEach(function(index){
                var feature = vectors.pick(index, null);
                var found = tree.findLeaf(feature).leaf;
                assert.strictEqual(found, index);
            });
        });

    });


    describe('#searchNN', function(){

        it('should found the exact NN of target (a.k.a targetNN)', function(){
            _.range(SAMPLE_SIZE).forEach(function(index){
                var v = targets.pick(index, null);
                var nnResult = matcher.searchNN(tree, v);
                var match = nnResult.optimal.feature;
                assert.strictEqual(index, match);
            });
        });

    });


    describe('#searchANN', function(){

        it('should find a NN within the tolerated error range', function(){
            _.range(SAMPLE_SIZE).forEach(function(index){
                var v = targets.pick(index, null);
                var ANN_THRESHOLD = 0.05;
                var annResult = matcher.searchANN(tree, v, ANN_THRESHOLD);
                assert.strictEqual(index, annResult.optimal.feature);
            });
        });

    });

    describe('#match', function(){

        it('match the exact features without delta', function(){

            var matches = matcher.match(vectors, vectors);

            assert(matches.every(function(pair){
                return pair[0] === pair[1];
            }));

        });

        it('match the exact features with delta', function(){

            var matches = matcher.match(vectors, targets);

            assert(matches.every(function(pair){
                return pair[0] === pair[1];
            }));

        });

    });


});