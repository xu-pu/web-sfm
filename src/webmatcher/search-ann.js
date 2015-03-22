'use strict';

var _ = require('underscore');

var laUtils = require('../math/la-utils.js'),
    BinaryMinimumQueue = require('./minimum-queue.js').BinaryMinimumQueue;

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