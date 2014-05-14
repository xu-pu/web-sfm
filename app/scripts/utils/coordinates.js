'use strict';

window.SFM = window.SFM || {};

/**
 *
 * @param {int} row
 * @param {int} col
 * @param {int} width
 * @param {int} height
 * @return {SFM.Matrix}
 */
SFM.RCtoImg = function(row, col, width, height){
    var cam = new SFM.Matrix({ cols: 1, rows: 3 });
    cam.set(0, 0, col);
    cam.set(1, 0, height-1-row);
    cam.set(2, 0, 1);
    return cam;
};

/**
 * @param {Feature} f
 * @param cam
 * @returns {SFM.Matrix}
 */
SFM.featureToImg = function(f, cam) {
    var c = new SFM.Matrix({ cols: 1, rows: 3 });
    c.set(0, 0, f.col);
    c.set(1, 0, cam.height-1- f.row);
    c.set(2, 0, 1);
    return c;
};


SFM.imgToCam = function(point, K){

};