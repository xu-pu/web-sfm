'use strict';

var _ = require('underscore');

var matching = require('./feature-matching.js'),
    MinimumQueue = require('./minimum-queue.js');

//==========================================================


/**
 *
 * @param {KdtreeNode} root
 * @param {Feature} feature
 * @param {number} n
 * @param {number} error - acceptable error ratio
 * @returns {MinimumQueue}
 */
module.exports = function(root, feature, n, error){
    var mins = new MinimumQueue(n);
    searchTree(root, feature, mins, error);
    return mins;
};


//==========================================================


/**
 *
 * @param {KdtreeNode} root
 * @param {Feature} feature
 * @param {MinimumQueue} mins
 * @param {number} error
 */
function searchTree(root, feature, mins, error){

    if (root.isLeaf) {
        mins.checkMin(root.leaf, matching.getFeatureDistance(feature, root.features[root.leaf]));
    }
    else {

        var cursor = root.findLeaf(feature), parent, kd, sibling;
        mins.checkMin(cursor.leaf, matching.getFeatureDistance(feature, root.features[cursor.leaf]));

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
