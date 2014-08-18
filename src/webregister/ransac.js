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
            console.log('return');
            console.log(options.trials-trials);
            console.log(inliers.length/options.dataset.length);
            return { dataset: inliers, rel: relEsitmate };
        }
        console.log('tried once');
        console.log(inliers.length/options.dataset.length);
        trials--;
    }
    throw "RANSAC faild";
}