'use strict';

var _ = require('underscore');

module.exports.Node = KdtreeNode;

//====================================================================


/**
 * Create root node from features
 * @param {Feature[]} features
 * @returns {KdtreeNode}
 */
module.exports.initTree = function(features){
    return new KdtreeNode(0, features.length-1, null, features);
};


/**
 * Kd-tree node class
 * @param {int} head
 * @param {int} tail
 * @param {KdtreeNode} parent
 * @param {Feature[]} features
 *
 * @property {int} head
 * @property {int} tail
 * @property {KdtreeNode} parent
 * @property {Feature[]} features
 *
 * @property {boolean} isLeaf
 * @property {KdtreeNode} [left]
 * @property {KdtreeNode} [right]
 * @property {int} [leaf]
 *
 * @property {number} [kv]
 * @property {number} [kvmin]
 * @property {number} [kvmax]
 *
 * @constructor
 */
function KdtreeNode(head, tail, parent, features){

    _.extend(this, {
        head: head,
        tail: tail,
        parent: parent,
        features: features
    });

    this.isLeaf = (tail - head) === 0;
    if (this.isLeaf) {
//        console.log('Leaf at ' + head);
        this.leaf = head;
    }
    else {
//        console.log('Node between ' + head + ' ~ ' + tail);
        this.findSplit();
        this.partition();
    }
}


/**
 *
 */
KdtreeNode.prototype.partition = function(){

    var head = this.head,
        tail = this.tail,
        features = this.features,
        ki = this.ki,
        kv = this.kv,
        n = tail-head+1;

//    console.log('split index ' + ki + ' at ' + kv);

    var cursor, counter = 0;
    for (cursor = head; cursor<=tail; cursor++) {
        if (features[cursor].vector[ki] <= kv) {
            swap(cursor, head+counter);
            counter += 1;
        }
    }

    if (counter === 0) {
        this.kv = this.kvmax;
        this.partition();
    }
    else if (counter === n) {
        this.kv = this.kvmin;
        this.partition();
    }
    else {
        this.left = new KdtreeNode(head, head+counter-1, this, features);
        this.right = new KdtreeNode(head+counter, tail, this, features);
    }

    function swap(i1, i2){
        var tmp = features[i1];
        features[i1] = features[i2];
        features[i2] = tmp;
    }

};


/**
 *
 */
KdtreeNode.prototype.findSplit = function(){

    var head = this.head,
        tail = this.tail,
        features = this.features,
        n = tail-head+1;

    var vecIndex, cursor, dimSlice, mean, variance,
        maxVariance = -Infinity, maxVarianceIndex;

    for (vecIndex=0; vecIndex<128; vecIndex++) {

        dimSlice = [];
        for (cursor=0; cursor<n; cursor++) {
            dimSlice[cursor] = features[head+cursor].vector[vecIndex];
        }

        mean = dimSlice.reduce(function(memo, val){
            return memo + val;
        }, 0)/n;

        variance = dimSlice.reduce(function(memo, val){
            var dif = val-mean;
            return memo + dif*dif;
        }, 0)/n;

        if (variance > maxVariance) {
            maxVariance = variance;
            maxVarianceIndex = vecIndex;
        }
    }


    dimSlice = [];
    for (cursor=0; cursor<n; cursor++) {
        dimSlice[cursor] = features[head+cursor].vector[maxVarianceIndex];
    }

    dimSlice.sort(function(a,b){ return a-b; });

    this.kv = n % 2 === 0 ? (dimSlice[n/2] + dimSlice[(n/2)-1]) / 2 : dimSlice[(n-1)/2];
    this.ki = maxVarianceIndex;
    this.kvmin = dimSlice[0];
    this.kvmax = dimSlice[dimSlice.length-1];

    //console.log('median ' + this.kv + ' from ' + dimSlice[0] + ' to ' + dimSlice[dimSlice.length-1]);

};
