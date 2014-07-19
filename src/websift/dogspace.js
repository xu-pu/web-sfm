var _ = require('underscore');
var blur = require('ndarray-gaussian-filter');
var ops = require('ndarray-ops');
var pool = require('ndarray-scratch');

module.exports = getDoGs;

/**
 * @typedef {{img, sigma: number}} DoG
 */

/**
 *
 * @param img
 * @param octave
 * @param options
 * @returns DoG[]
 */
function getDoGs(img, octave, options) {

    console.log('calculating dogs');

    options = options || {};
    _.defaults(options, {
        scales: 5
    });

    var sigmas = _.range(options.scales).map(function(s){
        return Math.pow(2, octave+s/options.scales);
    });

    var scales = sigmas.map(function(sigma){
        return blur(img, sigma);
    });

    return _.range(scales.length-1).map(function(index){
        var buffer = pool.malloc(img.shape);
        ops.sub(buffer, scales[index], scales[index+1]);
        return {
            img: buffer,
            sigma: sigmas[index]
        };
    });

}