'use strict';

module.exports.RCtoImg = RCtoImg;
module.exports.featureToImg = featureToImg;
module.exports.img2RT = img2RT;

/**
 *
 * @typedef {{height: number, width: number}} Camera
 */

/**
 *
 * @param {int} row
 * @param {int} col
 * @param {Camera} cam
 * @return {number[]}
 */
function RCtoImg(row, col, cam){
      return [col, cam.height-row, 1];
}

/**
 * @param {Feature} f
 * @param {Camera} cam
 * @returns {number[]}
 */
function featureToImg(f, cam) {
    return [f.col, cam.height-1-f.row, 1];
}

/**
 * @param x
 * @param {Number} height
 * @returns {{row: number, col: number}}
 */
function img2RT(x, height){
    return {
        row: height - x.elements[1]/x.elements[2],
        col: x.elements[0]/x.elements[2]
    };
}