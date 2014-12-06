'use strict';

var _ = require('underscore');

var kdtree = require('./kd-tree.js'),
    searcher = require('./search-ann.js');

//=============================================================


var ANN_ERROR_THRESHOLD = 0.1,
    ANN_THRESHOLD = 0.6,
    ANN_SQUARE = ANN_THRESHOLD*ANN_THRESHOLD;


//=============================================================


/**
 * Approximate Nearest Neighbor matching for SIFT features
 * @param {Feature[]} features1
 * @param {Feature[]} features2
 * @returns {number[][]}
 */
module.exports = function(features1, features2){

    var ff1 = features1,
        ff2 = features2,
        tree1 = kdtree.initTree(ff1),
        tree2 = kdtree.initTree(ff2);

    var matches = [],
        backMatches = []; // fi2 -> fi1

    tree1.features.forEach(function(f, i){

        var fi1, queue1,
            fi2, queue2;

        queue2 = searcher.searchANN(tree2, f, ANN_ERROR_THRESHOLD);

        if (isMatchValid(queue2)) {

            fi2 = queue2.optimal.feature;

            if (backMatches[fi2] === -1) {
                return;
            }
            else if (_.isNumber(backMatches[fi2])) {
                fi1 = backMatches[fi2];
            }
            else {
                queue1 = searcher.searchANN(tree1, tree2.features[fi2], ANN_ERROR_THRESHOLD);
                if (isMatchValid(queue1)) {
                    fi1 = queue1.optimal.feature;
                    backMatches[fi2] = fi1;
                }
                else {
                    backMatches[fi2] = -1;
                    return;
                }
            }

            if (fi1 === i) {
                matches.push([fi1, fi2]);
                console.log(matches.length + 'th found at ' + i + '/'+ features1.length);
            }

        }

    });

    return matches.map(function(pair){

        var fi1 = pair[0],
            fi2 = pair[1],
            f1 = tree1.features[fi1],
            f2 = tree2.features[fi2];

        return [
            features1.indexOf(f1),
            features2.indexOf(f2)
        ];

    });

};


/**
 * Do the minimum queue pass the ANN_THRESHOLD
 * @param {BinaryMinimumQueue} results
 * @returns {boolean}
 */
function isMatchValid(results){
    return results.optimal.dist/results.second.dist < ANN_SQUARE;
}