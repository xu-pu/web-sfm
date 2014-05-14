'use strict';

window.SFM = window.SFM || {};

SFM.GUASS_KERNEL_TEST = [
    [0.0030, 0.0133, 0.0219, 0.0133, 0.0030],
    [0.0133, 0.0596, 0.0983, 0.0596, 0.0133],
    [0.0219, 0.0983, 0.1621, 0.0983, 0.0219],
    [0.0133, 0.0596, 0.0983, 0.0596, 0.0133],
    [0.0030, 0.0133, 0.0219, 0.0133, 0.0030]
];


/**
 * Construct a Guassian kernel with specific radius
 * @param size
 * @param {number} sigma
 * @returns {SFM.Matrix}
 */
SFM.getGuassianKernel = function(size, sigma) {
    var kernel = new SFM.Matrix({ rows: size, cols: size, type: SFM.Matrix.DATA_FLOAT });
    var x, y, radius=Math.floor(size/2);
    var base = 1/(2*Math.PI*sigma*sigma);
    for (x=-radius; x<=radius; x++) {
        for (y=-radius; y<=radius; y++) {
            kernel.set(size-1-y-radius, x+radius, base*Math.exp(-(x*x+y*y)/(2*sigma*sigma)));
        }
    }
    return kernel;
};