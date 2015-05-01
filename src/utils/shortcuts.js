'use strict';


/**
 *
 * @param {int} length
 * @returns {number[]}
 */
exports.zeros = function(length){
    var result = new Array(length);
    var i;
    for (i=0; i<length; i++) {
        result[i] = 0;
    }
    return result;
};


/**
 *
 * @param {[]} arr
 * @param {function} callback
 */
exports.iterPairs = function(arr, callback){

    var length = arr.length;

    if (length<2) { return; }

    var cur1, cur2, counter=0;
    for (cur1=0; cur1<length-1; cur1++) {
        for (cur2=cur1+1; cur2<length; cur2++) {
            callback(arr[cur1], arr[cur2], counter);
            counter++;
        }
    }

};