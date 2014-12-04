'use strict';


/**
 *
 * @param {Feature} f1
 * @param {Feature} f2
 * @returns {Number}
 */
module.exports.getFeatureDistance = function(f1, f2){
    return f1.vector.reduce(function(memo, val, i){
        var diff = f1.vector[i] - f2.vector[i];
        return memo + diff*diff;
    }, 0);
};