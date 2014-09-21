var _ = require('underscore');

module.exports = ransac;

/**
 * @param {Object[]} options.dataset
 * @param {number} options.outlierThreshold
 * @param {int} options.trials
 * @param options.metadata -- passed to the relGenerator
 * @param {function} options.relGenerator
 * @param {function} options.errorGenerator
 * @param {number} options.errorThreshold
 * @param {int} options.subset
 * @return {{dataset: [], rel}}
 */
function ransac(options){
    var relEsitmate, inliers, trials=options.trials;
    while(trials !== 0){
        relEsitmate = options.relGenerator(_.sample(options.dataset, options.subset), options.metadata);
        inliers = _.filter(options.dataset, function(m){
            return options.errorGenerator(relEsitmate, m, options.metadata) < options.errorThreshold;
        });
        if (inliers.length/options.dataset.length >= 1-options.outlierThreshold) {
            console.log('Success, ' + inliers.length+'/'+options.dataset.length + ' passed RANSAC after ' + (options.trials-trials) + ' trials');
            return { dataset: inliers, rel: relEsitmate };
        }
        console.log(inliers.length+'/'+options.dataset.length+ ', ' + (100*inliers.length/options.dataset.length) + '% passed RANSAC, trial failed');
        trials--;
    }
    throw "RANSAC faild";
}