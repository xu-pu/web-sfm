'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

//=======================================

/**
 * @typedef {{height: number, width: number}} Camera
 */

//=======================================
// Convert between img and rc
// x=c, y+r=height-1,
//=======================================


/**
 *
 * @param {int} row
 * @param {int} col
 * @param {Camera} cam
 * @return {number[]}
 */
module.exports.RCtoImg = function(row, col, cam){
      return [col, cam.height-row, 1];
};


/**
 * @param point
 * @param {Number} height
 * @returns {{row: number, col: number}}
 */
module.exports.img2RT = function(point, height){
    point = point.x(1/point.e(3));
    return {
        row: height-point.e(2),
        col: point.e(1)
    };
};


/**
 * @param {number} x
 * @param {number} y
 * @param {Camera} cam
 * @returns {{row: number, col: number}}
 */
module.exports.bundler2RT = function(x, y, cam){
    var yy = y+cam.height/2,
        row = cam.height-yy,
        col = x+cam.width/2;
    return {
        row: row,
        col: col
    };

};


//=======================================
// Generate random cord
//=======================================


/**
 *
 * @param {Camera} cam
 */
module.exports.getRandomImgCord = function(cam){
    return Vector.create([Math.random()*cam.width, Math.random()*cam.height, 1]);
};


/**
 *
 * @param {Camera} cam
 */
module.exports.getRandomRT = function(cam){
    return {
        row: Math.random()*cam.height,
        col: Math.random()*cam.width
    };
};


//=======================================


/**
 * @param {Feature} f
 * @param {Camera} cam
 * @returns {number[]}
 */
module.exports.featureToImg = function(f, cam) {
    return exports.RCtoImg(f.row, f.col, cam);
};


/**
 *
 * @param line
 * @param {Camera} cam
 */
module.exports.imgline2points = function(line, cam){

    var results = [],
        width = cam.width,
        height = cam.height,
        p00 = Vector.create([0,0,1]),
        p01 = Vector.create([0,height,1]),
        p11 = Vector.create([width,height,1]),
        p10 = Vector.create([width,0,1]);

    [
        p00.cross(p01),
        p00.cross(p10),
        p01.cross(p11),
        p10.cross(p11)
    ]
        .map(function(edge){
            return edge.cross(line)
        })
        .forEach(function(point){
            var rt = rt2canvas(exports.img2RT(point, height), width, height);
            if (rt) {
                results.push(rt);
            }
        });

    return results;

};


function rt2canvas(rt, width, height){
    var row = Math.round(rt.row),
        col = Math.round(rt.col);
    if (row >=0 && col >=0 && row <= height && col <= width) {
        return {
            row: row,
            col: col
        };
    }
    else {
        return null;
    }
}