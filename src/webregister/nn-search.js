'use strict';

module.exports = searchNN;


function searchNN(root, feature, n){
    var mins = new MinimumQueue(n);
    searchTree(root, feature, mins);
    return mins;
}


/**
 *
 * @param {Node} root
 * @param {Feature} feature
 * @param {MinimumQueue} mins
 */
function searchTree(root, feature, mins){

    if (root.isLeaf) {
        min.checkMin(root.leaf, getDistance(feature, root.leaf));
    }

    var cursor = findLeaf(root, feature), parent, kd, sibling;

    do {

        parent = root.parent;
        kd = feature.vector[parent.ki] - parent.kv;
        kd = kd*kd;
        sibling = cursor === parent.left ? parent.right : parent.left;

        if (min.getMin() > kd) {
            searchTree(sibling, feature, mins);
        }

        cursor = parent;

    } while (cursor !== root);

}


/**
 *
 * @param {Feature} f1
 * @param {Feature} f2
 * @returns {Number}
 */
function getDistance(f1, f2){
    return f1.vector.reduce(function(memo, val, i){
        var diff = f1.vector[i] - f2.vector[i];
        return memo + diff*diff;
    }, 0);
}


/**
 *
 * @param {Node} root
 * @param {Feature} f
 * @returns {Node}
 */
function findLeaf(root, f){
    if (this.isLeaf) {
        return root;
    }
    else {
        return f.vector[root.ki] <= root.kv ? findLeaf(root.left, f) : findLeaf(root.right, f);
    }
}


/**
 *
 * @param n
 * @constructor
 */
function MinimumQueue(n){

}

MinimumQueue.prototype.getMin = function(){};

MinimumQueue.prototype.checkMin = function(){};
