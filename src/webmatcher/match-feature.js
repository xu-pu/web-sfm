'use strict';

var _ = require('underscore');

var kdtree = require('./kd-tree.js'),
    searcher = require('./search-ann.js');

//=============================================================


/**
 *
 * @param {Feature[]} features1
 * @param {Feature[]} features2
 * @returns {number[][]}
 */
module.exports = function(features1, features2){

    var ff1 = features1.map(function(f){ return f; }),
        ff2 = features2.map(function(f){ return f; }),
        tree1 = kdtree.initTree(ff1),
        tree2 = kdtree.initTree(ff2);

    var matches = [], backMatches = [];
    ff1.forEach(function(f, i){
        console.log('match one');
        var f2 = findNNFeature(tree2, f);
        if (f2 !== null) {
            var f1;
            if (_.isNumber(backMatches[f2])) {
                f1 = backMatches[f2];
            }
            else {
                f1 = findNNFeature(tree1, ff2[f2]);
                if (f1 !== null) {
                    backMatches[f2] = f1;
                }
            }
            if (f1 === i) {
                matches.push([f1, f2]);
            }
        }
    });

    return matches.map(function(pair){
        return [
            features1.indexOf(ff1[pair[0]]),
            features2.indexOf(ff2[pair[1]])
        ];
    });

};


/**
 *
 * @param {KdtreeNode} tree
 * @param {Feature} feature
 * @returns {number|null}
 */
function findNNFeature(tree, feature){
    var mins = searchNN(tree, feature, 2),
        queue = mins.queue;
    if (queue[0].dist/queue[1].dist < 0.6*0.6) {
        return queue[0].feature;
    }
    else {
        return null;
    }
}