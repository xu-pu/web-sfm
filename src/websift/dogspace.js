var _ = require('underscore');

module.exports = getDOGs;

/**
 * @typedef {{img, sigma: number, octave: number, scale}} DoG
 */

/**
 * @typedef {{ dogs: DoG[], octave: number, height: number, width: number }} DogSpace
 */

/**
 *
 * @param {Octave}  octave
 * @param options
 * @returns {DogSpace}
 */
function getDOGs(octave, options) {

    console.log('calculating dogs');

    options = options || {};

    _.defaults(options, {
        scales: 5
    });

    var scales = [];

    var dogs = _.range(1, scaleSpace.scales.length).map(function(index){
        var img = scaleSpace.scales[index-1].img.difference(scaleSpace.scales[index].img);
        return {
            img: img,
            octave: scaleSpace.octave,
            sigma: 1
        };
    });

    return {
        dogs: dogs,
        octave: octave.octave,
        width: octave.width,
        height: octave.height
    };

}