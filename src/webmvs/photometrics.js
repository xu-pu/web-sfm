'use strict';

//====================================================


/**
 * Normalized Cross Correlation (NCC) score, [0,1], higher better
 * @param {number[][]} array1
 * @param {number[][]} array2
 * @returns {number}
 */
module.exports.ncc = function(array1, array2){

    var size = array1.length,
        row, col,
        memo= 0,
        mean = Math.sqrt(
            getSqureSum(array1) * getSqureSum(array2)
        );

    for (row=0; row<size; row++) {
        for (col=0; col<size; col++) {
            memo += array1[row][col]*array2[row][col];
        }
    }

    return memo/mean;

};


/**
 * Photometric discrepency [0,1], lower better
 * @param {number[][]} array1
 * @param {number[][]} array2
 * @returns {number}
 */
module.exports.discrepency = function(array1, array2){
    return 1-exports.ncc(array1, array2);
};


//====================================================


/**
 * Square Sum
 * @param {number[][]} sample
 * @returns {number}
 */
function getSqureSum(sample){

    var row, col, cursor,
        size=sample.length,
        memo= 0;

    for (row=0; row<size; row++) {
        for (col=0; col<size; col++) {
            cursor = sample[row][col];
            memo += cursor*cursor;
        }
    }

    return memo;

}