'use strict';

module.exports.RCtoImg = RCtoImg;
module.exports.featureToImg = featureToImg;
module.exports.img2RT = img2RT;
module.exports.imgline2points = imgline2points;

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

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
 * @param point
 * @param {Number} height
 * @returns {{row: number, col: number}}
 */
function img2RT(point, height){
    return {
        row: height - point.elements[1]/point.elements[2],
        col: point.elements[0]/point.elements[2]
    };
}

function imgline2points(line, width, height){
    var results = [];
    [   Vector.create([1,0,0]).cross(line),
        Vector.create([1,0,-width]).cross(line),
        Vector.create([0,1,-height]).cross(line),
        Vector.create([0,1,0]).cross(line)
    ].forEach(function(point){
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