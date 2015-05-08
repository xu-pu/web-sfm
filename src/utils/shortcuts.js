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

/**
 *
 * @param {int} s1
 * @param {int} s2
 * @param v - init value
 */
exports.array2d = function(s1, s2, v){

    var arr = new Array(s1);

    var cur1, cur2, curArr;
    for (cur1=0; cur1<s1; cur1++) {
        curArr = arr[cur1] = new Array(s2);
        for (cur2=0; cur2<s2; cur2++) {
            curArr[cur2] = v;
        }
    }

    return arr;

};