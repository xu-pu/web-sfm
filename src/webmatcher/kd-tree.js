'use strict';

var _ = require('underscore');

//====================================================================


exports.KdtreeNode = KdtreeNode;


/**
 * Create root node from features
 * @param buffer - ndarray buffer of vectors
 * @returns {KdtreeNode}
 */
exports.initTree = function(buffer){
    var length = buffer.shape[0];
    return new KdtreeNode(0, length-1, null, buffer);
};


//====================================================================


/**
 * Kd-tree node class
 * @param {int} head
 * @param {int} tail
 * @param {KdtreeNode} parent
 * @param [buffer]
 *
 * @property {int} head
 * @property {int} tail
 * @property {KdtreeNode} parent
 * @property {KdtreeNode} root
 *
 * @property {boolean} isLeaf
 * @property {KdtreeNode} [left]
 * @property {KdtreeNode} [right]
 * @property {int} [leaf]
 *
 * @property {number} [kv]
 * @property {int} [ki]
 *
 * @constructor
 */
function KdtreeNode(head, tail, parent, buffer){

    this.head = head;
    this.tail = tail;
    this.parent = parent;
    this.length = tail-head+1;

    if (buffer) {
        this.vectorBuffer = buffer;
        this.width = buffer.shape[1];
        this.features = _.range(this.length);
        this.root = this;
    }
    else {
        this.root = parent.root;
    }

    this.isLeaf = (tail - head) === 0;
    if (this.isLeaf) {
        // console.log('Leaf at ' + head);
        this.leaf = this.root.features[head];
    }
    else {
        // console.log('Node between ' + head + ' ~ ' + tail);
        this.partition();
    }
}

KdtreeNode.prototype.get = function(i, iv){
    return this.root.vectorBuffer.get(i, iv);
};


KdtreeNode.prototype.findMaxVariance = function(){

    var head = this.head,
        tail = this.tail,
        features = this.root.features,
        n = tail-head+ 1,
        width = this.root.width;

    var vecIndex, cursor, dimSlice, mean, variance,
        maxVariance = -Infinity, maxVarianceIndex;

    for (vecIndex=0; vecIndex<width; vecIndex++) {

        dimSlice = [];
        for (cursor=0; cursor<n; cursor++) {
            dimSlice[cursor] = this.get(features[head+cursor], vecIndex);
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

    return maxVarianceIndex;

};


KdtreeNode.prototype.partition = function(){

    var node = this,
        head = this.head,
        tail = this.tail,
        features = this.root.features,
        length = this.length,
        width = this.root.width,
        maxVarianceIndex = this.findMaxVariance(),
        dimSlice = _.range(length)
            .map(function(cursor){
                return node.get(features[head+cursor], maxVarianceIndex);
            })
            .sort(function(a,b){
                return a-b;
            }),
        kv = this.kv = median(dimSlice),
        ki = this.ki = maxVarianceIndex;

    //console.log('median ' + this.kv + ' from ' + dimSlice[0] + ' to ' + dimSlice[dimSlice.length-1]);

    //=================
    // Partition
    //=================

    //console.log('split index ' + ki + ' at ' + kv);

    var cursor, counter = 0;
    for (cursor = head; cursor<=tail; cursor++) {
        if (this.get(features[cursor], ki) < kv) {
            swap(cursor, head+counter);
            counter += 1;
        }
    }

    if (counter === 0 || counter === length) {
        console.log('Coincide vector ' + dimSlice.join(',') + 'at ' + kv);
        this.isLeaf = true;
        this.leaf = head;
        return;
    }

    this.left = new KdtreeNode(head, head+counter-1, this);
    this.right = new KdtreeNode(head+counter, tail, this);

    function swap(i1, i2){
        var tmp = features[i1];
        features[i1] = features[i2];
        features[i2] = tmp;
    }

    function median(a){
        var arr = _.uniq(a, true),
            len = arr.length,
            midpoint;
        if (len % 2 === 0) {
            midpoint = len/2;
            return 0.5 * (arr[midpoint] + arr[midpoint-1]);
        }
        else {
            midpoint = (len-1)/2;
            return arr[midpoint];
        }
    }

};


/**
 * Find nearest leaf node
 * @param v - ndarray
 * @returns {KdtreeNode}
 */
KdtreeNode.prototype.findLeaf = function(v){

    if (this.isLeaf) {
        return this;
    }
    else {
        return (v.get(this.ki) < this.kv) ? this.left.findLeaf(v) : this.right.findLeaf(v);
    }

};