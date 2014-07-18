var _ = require('underscore');

module.exports = getScale;

/**
 * Construct the scale space of the image
 * @param {SFM.Grayscale} img
 * @param {number} sigma
 * @param options
 * @returns {Scale}
 */
function getScale(img, sigma, options) {

    console.log('calculating scalespace');

    options = options || {};
    _.defaults(options, {

    });

    var scaleSpace = _.range(0, options.scales).map(function(scale){
        sigma *= Math.sqrt(2);
        var i = img;
        if (scale !== 0) {
            i = new SFM.Grayscale({ image: img });
            i.convolution(SFM.getGuassianKernel(options.kernelSize, sigma).getNativeRows());
        }
        return {
            img: i,
            sigma: sigma,
            octave: octave
        };
    });
    //console.log(scaleSpace);
    return {
        scales: scaleSpace,
        octave: octave,
        width: img.width,
        height: img.height
    };
}