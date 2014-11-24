'use strict';

var _ = require('underscore');

var ransac = require('./ransac.js'),
    eightpoint = require('./eightpoint.js'),
    estimateFmatrix = require('./estimate-fmatrix.js'),
    cord = require('../utils/cord.js');

/**
 *
 * @param matches
 * @param metadata
 * @returns {{dataset: [], rel}}
 */
module.exports = function(matches, metadata){

    return ransac({
        dataset: matches,
        metadata: metadata,
        subset: 10,
        relGenerator: estimateFmatrix,
        errorGenerator: eightpoint.fundamentalMatrixError,
        outlierThreshold: 0.2,
        errorThreshold: 5,
        trials: 1000
    });

};