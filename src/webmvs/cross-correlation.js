'use strict';


/**
 * Normalized Cross Correlation score
 * @param {number[][]} array1
 * @param {number[][]} array2
 * @returns {number}
 */
module.exports = function(array1, array2){

    var size = array1.length,
        row, col,
        memo= 0,
        mean1 = getMean(array1),
        mean2 = getMean(array2),
        mean = mean1*mean2;

    for (row=0; row<size; row++) {
        for (col=0; col<size; col++) {
            memo += (array1[row][col]*array2[row][col]-mean);
        }
    }

    return memo;

};


/**
 *
 * @param {number[][]} sample
 * @returns {number}
 */
function getMean(sample){

    var row, col,
        size=sample.length,
        memo=0;

    for (row=0; row<size; row++) {
        for (col=0; col<size; col++) {
            memo += sample[row][col];
        }
    }

    return memo/(size*size);

}