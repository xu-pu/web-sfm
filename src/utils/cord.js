'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

//=======================================


/**
 * @typedef {{ height: number, width: number }} Camera
 */


//=======================================


var BUNDLER_CONVERSION = Matrix.create([
    [ 1,  0,  0 ],
    [ 0, -1,  0 ],
    [ 0,  0, -1 ]
]);


/**
 * Convert bundler cord system to websfm cord system
 * bundler's camera is right hand and negative focal plane
 * @param {Matrix} R
 * @param {Vector} t
 * @returns {{R: Matrix, t: Matrix}}
 */
module.exports.getStandardRt = function(R ,t){
    return {
        R: BUNDLER_CONVERSION.x(R),
        t: BUNDLER_CONVERSION.x(t)
    };
};


//=======================================
// Convert between img and rc
// row := y
// col := x
//=======================================


/**
 * @param {int} row
 * @param {int} col
 * @return {number[]}
 */
module.exports.rc2img = function(row, col){
      return [col, row, 1];
};


/**
 * @param point
 * @returns {{row: number, col: number}}
 */
module.exports.img2RC = function(point){
    point = point.x(1/point.e(3));
    return { row: point.e(2), col: point.e(1) };
};


//=======================================


/**
 * @param {Feature} f
 * @returns {number[]}
 */
module.exports.featureToImg = function (f) {
    return exports.rc2img(f.row, f.col);
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
            var rt = rt2canvas(exports.img2RC(point), width, height);
            if (rt) {
                results.push(rt);
            }
        });

    return results;

};


//=======================================


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