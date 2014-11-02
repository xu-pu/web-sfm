'use strict';

var _ = require('underscore');

module.exports.Node = Node;
module.exports.Root = Root;


/**
 *
 * @param {Feature[]} features
 * @returns {Node}
 * @constructor
 */
function Root(features){
    return new Node(0, features.length-1, null, features);
}


/**
 * @param {int} head
 * @param {int} tail
 * @param {Node} parent
 * @param {Feature[]} features
 * @constructor
 */
function Node(head, tail, parent, features){

    _.extend(this, {
        head: head,
        tail: tail,
        parent: parent,
        features: features
    });

    this.isLeaf = (tail - head) === 0;
    if (this.isLeaf) {
        this.leaf = head;
    }
    else {
        this.findSplit();
        this.partition();
    }
}


/**
 *
 */
Node.prototype.partition = function(){

    var head = this.head,
        tail = this.tail,
        features = this.features,
        ki = this.ki,
        kv = this.kv;

    var cursor, counter = 0;
    for (cursor = head; cursor<=tail; cursor++) {
        if (features[cursor].vector[ki] <= kv) {
            swap(cursor, counter);
            counter += 1;
        }
    }

    this.left = new Node(head, head+counter-1, this, features);
    this.right = new Node(head+counter, tail, this, features);

    function swap(i1, i2){
        var tmp = features[i1];
        features[i1] = features[i2];
        features[i2] = tmp;
    }

};


/**
 *
 */
Node.prototype.findSplit = function(){

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

    dimSlice.sort();

    this.kv = n % 2 === 0 ? (dimSlice[n / 2] + dimSlice[(n / 2) - 1]) / 2 : dimSlice[(n - 1) / 2];
    this.ki = maxVarianceIndex;

};
