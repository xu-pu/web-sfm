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