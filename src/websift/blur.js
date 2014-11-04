'use strict';

var kernels = require('../math/kernels.js');


/**
 *
 * @param target
 * @param source
 * @param {number} sigma
 * @param {int} radius
 */
module.exports = function(target, source, sigma, radius){

    var size = radius*2 - 1,
        center = radius-1,
        rows = target.shape[1],
        cols = target.shape[0],
        kern = kernels.getGuassianKernel(size, sigma).elements;

    var row, col, offsetR, offsetC, pixel;
    for (row=0; row<rows; row++) {
        for (col=0; col<cols; col++) {
            pixel = 0;
            for(offsetR=-1; offsetR<2; offsetR++) {
                for(offsetC=-1; offsetC<2; offsetC++) {
                    pixel += kern[center+offsetR][center+offsetC] * (source.get(col+offsetC, row+offsetR) || 0);
                }
            }
            target.set(col, row, pixel);
        }
    }


};