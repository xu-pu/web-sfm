'use strict';

var _ = require('underscore');

//=======================================================


module.exports.MinimumQueue = MinimumQueue;
module.exports.BinaryMinimumQueue = BinaryMinimumQueue;


//=======================================================


/**
 * @typedef {{ dist: number, feature: int }} QueueEntry
 */


//=======================================================


/**
 * Queue for finding top 2 minimum
 *
 * @property {QueueEntry} optimal
 * @property {QueueEntry} second
 *
 * @constructor
 */
function BinaryMinimumQueue(){
    this.optimal = { dist: Infinity, feature: -1 };
    this.second = { dist: Infinity, feature: -1 };
}


/**
 * Get largest minimum
 * @returns {number}
 */
BinaryMinimumQueue.prototype.getMin = function(){
    return this.second.dist;
};


/**
 * Check the queue
 * @param {int} index
 * @param {number} dist
 */
BinaryMinimumQueue.prototype.checkMin = function(index, dist){

    if (dist < this.optimal.dist) {
        this.second = this.optimal;
        this.optimal = { feature: index, dist: dist };
    }
    else if (dist < this.second.dist) {
        this.second = { feature: index, dist: dist };
    }

};


//=======================================================


/**
 * Queue for finding top N minimum
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
 * Get largest minimum
 * @returns {number}
 */
MinimumQueue.prototype.getMin = function(){
    return this.queue[this.length-1].dist;
};


/**
 * Check the queue
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