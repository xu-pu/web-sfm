'use strict';


/**
 *
 * @param {int} length
 * @returns {number[]}
 */
module.exports.zeros = function(length){
    var result = new Array(length);
    var i;
    for (i=0; i<length; i++) {
        result[i] = 0;
    }
    return result;
};