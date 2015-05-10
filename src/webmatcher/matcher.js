'use strict';

var _ = require('underscore');

var laUtils = require('../math/la-utils.js'),
    BinaryMinimumQueue = require('./minimum-queue.js').BinaryMinimumQueue,
    kdtree = require('./kd-tree.js');

var ANN_ERROR_THRESHOLD = 0.1,
    ANN_THRESHOLD = 0.6,
    ANN_SQUARE = ANN_THRESHOLD*ANN_THRESHOLD;


//==========================================================

/**
 * Approximate Nearest Neighbor matching for SIFT features
 * @param vectors1
 * @param vectors2
 * @returns {number[][]}
 */
exports.match = function(vectors1, vectors2){

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

            queue2 = exports.searchANN(tree2, f, ANN_ERROR_THRESHOLD);

            if (isMatchValid(queue2)) {

                fi2 = queue2.optimal.feature;

                if (backMatches[fi2] === -1) {
                    return;
                }
                else if (_.isNumber(backMatches[fi2])) {
                    fi1 = backMatches[fi2];
                }
                else {
                    queue1 = exports.searchANN(tree1, vectors2.pick(fi2), ANN_ERROR_THRESHOLD);
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


//==========================================================


/**
 * Approximate Nearest Neighbor (ANN) search on Kd-tree
 * @param {KdtreeNode} root
 * @param vector
 * @param {number} error - acceptable error ratio
 * @returns {BinaryMinimumQueue}
 */
exports.searchANN = function(root, vector, error){
    var mins = new BinaryMinimumQueue();
    searchTree(root, vector, mins, error);
    return mins;
};


/**
 * Nearest Neighbor (NN) search on Kd-tree
 * @param {KdtreeNode} root
 * @param {Feature} feature
 * @returns {BinaryMinimumQueue}
 */
exports.searchNN = function(root, feature){
    return exports.searchANN(root, feature, 0);
};


/**
 * Bruteforce NN search for (f) in (features)
 * @param {Feature} f
 * @param {Feature[]} features
 * @returns {BinaryMinimumQueue}
 */
exports.searchBruteforce = function(f, features){
    var mins = new BinaryMinimumQueue();
    features.forEach(function(f2, index2){
        mins.checkMin(index2, laUtils.getFeatureDistance(f, f2));
    });
    return mins;
};


//==========================================================


/**
 * Recursive search for ANN on a Kd-tree
 * @param {KdtreeNode} tree
 * @param vector
 * @param {MinimumQueue|BinaryMinimumQueue} mins
 * @param {number} error
 */
function searchTree(tree, vector, mins, error){

    var treebuffer = tree.root.vectorBuffer;
    var width = tree.root.width;

    if (tree.isLeaf) {
        mins.checkMin(tree.leaf, vectorDistSquare(vector, treebuffer.pick(tree.leaf, null)));
    }
    else {

        var cursor = tree.findLeaf(vector), parent, kd, sibling;
        mins.checkMin(cursor.leaf, vectorDistSquare(vector, treebuffer.pick(cursor.leaf, null)));

        //console.log(cursor.leaf);

        do {

            parent = cursor.parent;
            kd = vector.get(parent.ki) - parent.kv;
            kd = kd*kd;
            sibling = (cursor === parent.left) ? parent.right : parent.left;

            // this is where different from nn
            if (mins.getMin()*(1-error)*(1-error) > kd) {
                searchTree(sibling, vector, mins, error);
            }

            cursor = parent;

        } while (cursor !== tree);

    }

    function vectorDistSquare(v1, v2){
        var i, cur, acc=0;
        for (i=0; i<width; i++) {
            cur = v1.get(i) - v2.get(i);
            acc += cur*cur;
        }
        return acc;
    }

}