'use strict';


/**
 *
 * @param {Feature} f1
 * @param {Feature} f2
 * @returns {Number}
 */
module.exports.getFeatureDistance = function(f1, f2){

    var index, cursor,
        vector1 = f1.vector,
        vector2 = f2.vector,
        memo = 0,
        range = f1.vector.length;

    for (index=0; index<range; index++) {
        cursor = vector1[index] - vector2[index];
        memo += cursor*cursor;
    }

    return memo;

/*
    return f1.vector.reduce(function(memo, val, i){
        var diff = f1.vector[i] - f2.vector[i];
        return memo + diff*diff;
    }, 0);
*/

};