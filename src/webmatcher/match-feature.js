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
 * @param vectors1
 * @param vectors2
 * @returns {number[][]}
 */
module.exports = function(vectors1, vectors2){

    var length1 = vectors1.shape[0],
        length2 = vectors2.shape[1],
        tree1 = kdtree.initTree(vectors1),
        tree2 = kdtree.initTree(vectors2);

    var matches = [],
        backMatches = []; // fi2 -> fi1

    var i;
    for (i = 0; i<length1; i++) {
        (function(){

            var fi1, queue1,
                fi2, queue2,
                f = vectors1.pick(i, null);

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
                    queue1 = searcher.searchANN(tree1, vectors2.pick(fi2), ANN_ERROR_THRESHOLD);
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
                    console.log(matches.length + 'th found at ' + i + '/'+ length1);
                }

            }

        })();

    }

    return matches;

};


/**
 * Do the minimum queue pass the ANN_THRESHOLD
 * @param {BinaryMinimumQueue} results
 * @returns {boolean}
 */
function isMatchValid(results){
    return results.optimal.dist/results.second.dist < ANN_SQUARE;
}