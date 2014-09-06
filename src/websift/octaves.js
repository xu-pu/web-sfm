var _ = require('underscore');


/**
 * @typedef {{ data, octave: number, height: number, width: number }} Octave
 */


module.exports = iterOctaves;

/**
 * Construct octave space of the grayscale image
 * @param img
 * @param options
 * @param {function} callback
 */
function iterOctaves(img, options, callback){
    var width = img.width,
        height = img.height;
    var row, col, lastBase, base=img;
    _.range(options.octaves).forEach(function(octave){
        if (octave > 0) {
            // create shrinked version of the previous octave
            width = Math.floor(width/2);
            height = Math.floor(height/2);
            base = new SFM.Grayscale({ width: width, height: height });
            for (row=0; row<height; row++) {
                for (col=0; col<width; col++) {
                    base.setRC(row, col, (lastBase.get(row*2, col*2)+lastBase.get(row*2+1,col*2)+lastBase.get(row*2, col*2+1)+lastBase.get(row*2+1, col*2+1))/4);
                }
            }
        }
        callback(base);
        lastBase = base;
    });
}