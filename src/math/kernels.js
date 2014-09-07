'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var SOBEL_KERNEL_X = [
    [-1,0,1],
    [-2,0,2],
    [-1,0,1]
];

var SOBEL_KERNEL_Y = [
    [ 1, 2, 1],
    [ 0, 0, 0],
    [-1,-2,-1]
];

var GUASS_KERNEL_TEST = [
    [0.0030, 0.0133, 0.0219, 0.0133, 0.0030],
    [0.0133, 0.0596, 0.0983, 0.0596, 0.0133],
    [0.0219, 0.0983, 0.1621, 0.0983, 0.0219],
    [0.0133, 0.0596, 0.0983, 0.0596, 0.0133],
    [0.0030, 0.0133, 0.0219, 0.0133, 0.0030]
];


module.exports.getGuassianKernel = getGuassianKernel;
module.exports.sobelX = Matrix.create(SOBEL_KERNEL_X);
module.exports.sobelY = Matrix.create(SOBEL_KERNEL_Y);


/**
 * Construct a Guassian kernel with specific radius
 * @param size
 * @param {number} sigma
 */
function getGuassianKernel(size, sigma) {
    var kernel = Matrix.Zero(size, size);
    var x, y, centerX=(size-1)/2, centerY=(size-1)/2;
    for (x=0; x<size; x++) {
        for (y=0; y<size; y++) {
            kernel.elements[y][x] = gussianFunction2d(x-centerX, y-centerY, sigma);
        }
    }
    return kernel;
}


function gussianFunction2d(x,y,sigma){
    return Math.exp(-(x*x+y*y)/(2*sigma*sigma))/(2*Math.PI*sigma*sigma);
}