'use strict';

var kdtree = require('./kd-tree.js'),
    searchNN = require('./nn-search.js');

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

    var matches = [];
    ff1.forEach(function(f, i){
        var match = findNNFeature(tree2, f);
        if (match !== null) {
            var matchBack = findNNFeature(tree1, ff2[match]);
            if (matchBack === i) {
                matches.push([i, match]);
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
 * @param {Node} tree
 * @param {Feature} feature
 * @returns {number|null}
 */
function findNNFeature(tree, feature){
    var mins = searchNN(tree, feature, 2);
    if (mins[0].dist/mins[1].dist < 0.6) {
        return mins[0].feature;
    }
    else {
        return null;
    }
}