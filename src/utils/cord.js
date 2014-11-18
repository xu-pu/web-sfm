'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


module.exports.RCtoImg = RCtoImg;
module.exports.featureToImg = featureToImg;
module.exports.img2RT = img2RT;
module.exports.imgline2points = imgline2points;
module.exports.getRandomImgCord = getRandomImgCord;
module.exports.getRandomRT = getRandomRT;


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
function RCtoImg(row, col, cam){
      return [col, cam.height-row, 1];
}


/**
 * @param point
 * @param {Number} height
 * @returns {{row: number, col: number}}
 */
function img2RT(point, height){
    point = point.x(1/point.e(3));
    return {
        row: height-point.e(2),
        col: point.e(1)
    };
}

//=======================================

/**
 *
 * @param line
 * @param {Camera} cam
 */
function imgline2points(line, cam){

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
            var rt = rt2canvas(img2RT(point, height), width, height);
            if (rt) {
                results.push(rt);
            }
        });

    return results;

}


function rt2canvas(rt, width, height){
    if (rt.row >=0 && rt.col >=0 && rt.row <= height && rt.col <= width) {
        return {
            row: Math.floor(rt.row),
            col: Math.floor(rt.col)
        };
    }
    else {
        return null;
    }
}


/**
 * @param {Feature} f
 * @param {Camera} cam
 * @returns {number[]}
 */
function featureToImg(f, cam) {
    return RCtoImg(f.row, f.col, cam);
}


/**
 *
 * @param {Camera} cam
 */
function getRandomImgCord(cam){
    return Vector.create([Math.random()*cam.width, Math.random()*cam.height, 1]);
}


/**
 *
 * @param {Camera} cam
 */
function getRandomRT(cam){
    return {
        row: Math.random()*cam.height,
        col: Math.random()*cam.width
    };
}