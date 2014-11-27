'use strict';

var _ = require('underscore');

//===============================================================================


/**
 * @param {[]} options.dataset
 * @param {number}   options.outlierThreshold
 * @param {int}      options.trials
 * @param            options.metadata
 * @param {function} options.relGenerator   -- (subset, metadata) => rel
 * @param {function} options.errorGenerator -- (rel, entry, metadata) => error
 * @param {number}   options.errorThreshold
 * @param {int}      options.subset
 * @return {{dataset: [], rel}}
 */
module.exports = function(options){

    var dataset           = options.dataset,
        metadata          = options.metadata,
        errorGenerator    = options.errorGenerator,
        relGenerator      = options.relGenerator,
        OUTLIER_THRESHOLD = options.outlierThreshold,
        ERROR_THRESHOLD   = options.errorThreshold,
        SUBSET            = options.subset,
        TRIALS            = options.trials;

    var relEsitmate, inliers,
        trials=TRIALS;

    while(trials !== 0){
        relEsitmate = relGenerator(_.sample(dataset, SUBSET), metadata);
        inliers = dataset.filter(function(entry){
            return errorGenerator(relEsitmate, entry, metadata) < ERROR_THRESHOLD;
        });
        if (inliers.length/dataset.length >= 1-OUTLIER_THRESHOLD) {
            console.log('Success, ' + inliers.length + '/' + dataset.length + ' passed RANSAC after ' + (TRIALS-trials) + ' trials');
            return { dataset: inliers, rel: relEsitmate };
        }
        console.log(inliers.length + '/' + dataset.length + ', ' + (100*inliers.length/dataset.length) + '% passed RANSAC, trial failed');
        trials--;
    }

    throw "RANSAC faild";

};