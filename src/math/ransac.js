'use strict';

var _ = require('underscore');

//===============================================================================


/**
 * RANSAC (Random Sample Consensus)
 * @param {[]}       options.dataset
 * @param {number}   options.outlierThreshold
 * @param {int}      options.trials
 * @param {object}   options.metadata -- passed to relGenerator and errorGenerator
 * @param {function} options.relGenerator   -- (subset, metadata) => constrain
 * @param {function} options.errorGenerator -- (constrain, entry, metadata) => error
 * @param {number}   options.errorThreshold
 * @param {int}      options.subset
 * @return {{ dataset: [], rel }} -- inliners and estimated constrain
 */
module.exports = function(options){

    var dataset           = options.dataset,
        metadata          = options.metadata,
        errorGenerator    = options.errorGenerator,
        estimateConstrain = options.relGenerator,
        OUTLIER_THRESHOLD = options.outlierThreshold,
        ERROR_THRESHOLD   = options.errorThreshold,
        SUBSET_SIZE       = options.subset,
        TRIALS            = options.trials;

    if (dataset.length < SUBSET_SIZE) {
        throw 'Dataset too small, RANSAC failed to initiate';
    }

    var constrain, inliers, inlierRatio, trials=0;

    while(trials < TRIALS){
        trials++;
        constrain = estimateConstrain(_.sample(dataset, SUBSET_SIZE), metadata);
        inliers = dataset.filter(function(entry){
            return errorGenerator(constrain, entry, metadata) < ERROR_THRESHOLD;
        });
        inlierRatio = inliers.length/dataset.length;
        if (inlierRatio >= 1-OUTLIER_THRESHOLD) {
            console.log('Success, ' + inliers.length + '/' + dataset.length + ' passed RANSAC after ' + trials + ' trials');
            return { dataset: inliers, rel: constrain };
        }
        console.log(inliers.length + '/' + dataset.length + ', ' + (100*inlierRatio) + '% passed RANSAC, trial failed');
    }

    throw "RANSAC faild";

};