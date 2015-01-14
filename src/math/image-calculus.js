'use strict';

/**
 * @typedef {{ mag: number, ori: number }} Gradient
 */


/**
 *
 * @param img
 * @param {int} x
 * @param {int} y
 * @returns {Gradient|null}
 */
module.exports.discreteGradient = function(img, x, y){

    if (!( x>0 && x<img.shape[0]-1 && y>0 && y<img.shape[1]-1 )) {
        return null;
    }

    var dx = exports.discreteDx(img, x, y),
        dy = exports.discreteDy(img, x, y);

    if (dx === 0 && dy === 0) {
        return null;
    }
    else {
        var mag = Math.sqrt(dx*dx+dy*dy),
            ori = Math.atan2(dy, dx);
        return { mag: mag, ori: ori };
    }

};


/**
 *
 * @param img
 * @param {int} x
 * @param {int} y
 * @returns {number}
 */
module.exports.discreteDx = function(img, x, y) {
    return img.get(x+1, y) - img.get(x-1, y);
};


/**
 *
 * @param img
 * @param {int} x
 * @param {int} y
 * @returns {number}
 */
module.exports.discreteDxx = function(img, x, y){

};


/**
 *
 * @param img
 * @param {int} x
 * @param {int} y
 * @returns {number}
 */
module.exports.discreteDy = function(img, x, y){
    return img.get(x, y-1) - img.get(x, y+1);
};


/**
 *
 * @param img
 * @param {int} x
 * @param {int} y
 * @returns {number}
 */
module.exports.discreteDyy = function(img, x, y){

};