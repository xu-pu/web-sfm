var _ = require('underscore'),
    eightPoint = require('eightpoint.js'),
    ransac = require('./ransac.js'),
    bruteforce = require('./bruteforce-matching.js'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports = twoViewMatch;

/**
 *
 * @param {{ cam1, cam2, features1, features2 }} data
 */
function twoViewMatch(data){
    var ANN_THRESHOLD = 0.8;
    var matches = bruteforce(data.features1, data.features2, ANN_THRESHOLD);
    var result = ransac({
        dataset: matches,
        metadata: data,
        subset: 8,
        relGenerator: eightPoint,
        errorGenerator: eightPoint.fundamentalMatrixError,
        outlierThreshold: 0.1,
        errorThreshold: 0.5,
        trials: 1000
    });
    return result.dataset;
}

