'use strict';

if (typeof SFM === 'undefined') {
    var SFM = {};
}


SFM.SOBEL_KERNEL_X = [
    [-1,0,1],
    [-2,0,2],
    [-1,0,1]
];

SFM.SOBEL_KERNEL_Y = [
    [ 1, 2, 1],
    [ 0, 0, 0],
    [-1,-2,-1]
];


SFM.GUASS_KERNEL_TEST = [
    [0.0030, 0.0133, 0.0219, 0.0133, 0.0030],
    [0.0133, 0.0596, 0.0983, 0.0596, 0.0133],
    [0.0219, 0.0983, 0.1621, 0.0983, 0.0219],
    [0.0133, 0.0596, 0.0983, 0.0596, 0.0133],
    [0.0030, 0.0133, 0.0219, 0.0133, 0.0030]
];


/**
 *
 * @param {number[][]} array
 * @return {SFM.Matrix}
 */
SFM.M = function(array){
    return new SFM.Matrix({ array: array });
};

/**
 *
 * @param {number[]} row
 * @return {SFM.Matrix}
 */
SFM.R = function(row){
    if (_.isArray(row)) {
        return SFM.M([row]);
    }
    else {
        return SFM.R(Array.slice(arguments));
    }
};

/**
 *
 * @param {number[]} col
 * @return {SFM.Matrix}
 */
SFM.C = function(col){
    if (_.isArray(col)) {
        return SFM.M([col]).transpose();
    }
    else {
        return SFM.C(Array.slice(arguments));
    }
};


/**
 * @param {number} size
 * @return {SFM.Matrix}
 */
SFM.I = function(size){
    var m = new SFM.Matrix({ cols: size, rows: size });
    _.each(_.range(size), function(i){
        m.set(i,i,1);
    });
    return m;
};


/**
 *
 * @param {SFM.Matrix} m1
 * @param {SFM.Matrix} m2
 * @return {number}
 */
SFM.diffL2 = function(m1, m2){
    var row, col, diff=0;
    for (row=0; row<m1.rows; row++) {
        for (col=0; col<m1.cols; col++) {
            diff += Math.pow(m1.get(row, col)-m2.get(row, col), 2);
        }
    }
    return diff;
};


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