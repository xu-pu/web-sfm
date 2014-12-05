'use strict';

var _ = require('underscore');

var laUtils = require('../math/la-utils.js'),
    BinaryMinimumQueue = require('./minimum-queue.js').BinaryMinimumQueue;

//==========================================================


/**
 * Approximate Nearest Neighbor (ANN) search on Kd-tree
 * @param {KdtreeNode} root
 * @param {Feature} feature
 * @param {number} error - acceptable error ratio
 * @returns {BinaryMinimumQueue}
 */
module.exports.searchANN = function(root, feature, error){
    var mins = new BinaryMinimumQueue();
    searchTree(root, feature, mins, error);
    return mins;
};


/**
 * Nearest Neighbor (NN) search on Kd-tree
 * @param {KdtreeNode} root
 * @param {Feature} feature
 * @returns {BinaryMinimumQueue}
 */
module.exports.searchNN = function(root, feature){
    return exports.searchANN(root, feature, 0);
};


/**
 * Bruteforce NN search for (f) in (features)
 * @param {Feature} f
 * @param {Feature[]} features
 * @returns {BinaryMinimumQueue}
 */
module.exports.searchBruteforce = function(f, features){
    var mins = new BinaryMinimumQueue();
    features.forEach(function(f2, index2){
        mins.checkMin(index2, laUtils.getFeatureDistance(f, f2));
    });
    return mins;
};


//==========================================================


/**
 * Recursive search for ANN on a Kd-tree
 * @param {KdtreeNode} root
 * @param {Feature} feature
 * @param {MinimumQueue|BinaryMinimumQueue} mins
 * @param {number} error
 */
function searchTree(root, feature, mins, error){

    if (root.isLeaf) {
        mins.checkMin(root.leaf, laUtils.getFeatureDistance(feature, root.features[root.leaf]));
    }
    else {

        var cursor = root.findLeaf(feature), parent, kd, sibling;
        mins.checkMin(cursor.leaf, laUtils.getFeatureDistance(feature, root.features[cursor.leaf]));

        //console.log(cursor.leaf);

        do {

            parent = cursor.parent;
            kd = feature.vector[parent.ki] - parent.kv;
            kd = kd*kd;
            sibling = cursor === parent.left ? parent.right : parent.left;

            // this is where different from nn
            if (mins.getMin()*(1-error) > kd) {
                searchTree(sibling, feature, mins, error);
            }

            cursor = parent;

        } while (cursor !== root);

    }

}