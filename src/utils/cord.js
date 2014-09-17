module.exports.RCtoImg = RCtoImg;
module.exports.featureToImg = featureToImg;

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
      return [col, cam.height-1-row, 1];
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
 * @param {Camera} cam
 * @returns {{row: number, col: number}}
 */
function img2RT(x, cam){
    return {
        row: (cam.height-x.elements[1]) / x.elements[2],
        col: x.elements[0]/ x.elements[2]
    };
}