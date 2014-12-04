'use strict';

var _ = require('underscore');

//=======================================================

module.exports = MinimumQueue;

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