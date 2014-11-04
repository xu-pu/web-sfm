'use strict';

var _ = require('underscore');

module.exports = searchNN;


/**
 *
 * @param {Node} root
 * @param {Feature} feature
 * @param {number} n
 * @returns {MinimumQueue}
 */
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
        mins.checkMin(root.leaf, getDistance(feature, root.features[root.leaf]));
    }
    else {

        var cursor = findLeaf(root, feature), parent, kd, sibling;
        mins.checkMin(cursor.leaf, getDistance(feature, root.features[cursor.leaf]));

        //console.log(cursor.leaf);

        do {

            parent = cursor.parent;
            kd = feature.vector[parent.ki] - parent.kv;
            kd = kd*kd;
            sibling = cursor === parent.left ? parent.right : parent.left;

            if (mins.getMin() > kd) {
                searchTree(sibling, feature, mins);
            }

            cursor = parent;

        } while (cursor !== root);

    }

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
    if (root.isLeaf) {
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
    this.length = n;
    this.queue = _.range(n).map(function(){
        return { dist: Infinity, feature: null };
    });
}


/**
 *
 */
MinimumQueue.prototype.getMin = function(){
    return this.queue[this.length-1].dist;
};


/**
 *
 * @param {int} index
 * @param {number} dist
 */
MinimumQueue.prototype.checkMin = function(index, dist){

    var queue = this.queue,
        length = this.length;

    var cursor, offset;

    for (cursor=0; cursor<length; cursor++) {
        if (queue[cursor].dist > dist) {
            break;
        }
    }

    if (cursor < length) {
        for (offset=length-cursor-1; offset>0; offset--) {
            queue[cursor+offset] = queue[cursor+offset-1];
        }
        queue[cursor] = { dist: dist, feature: index };
    }

};
