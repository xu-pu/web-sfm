'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

//=====================================================


var DEFAULT_CAMERA = {
    width: 3008,
    height: 2000
};


//=======================================
// Generate random cord
//=======================================


/**
 * Create ramdom img cord
 * @param {Camera} [cam]
 * @return {Vector}
 */
module.exports.getRandomImgCord = function(cam){

    cam = cam || DEFAULT_CAMERA;

    return Vector.create([
        Math.random() * cam.width,
        Math.random() * cam.height,
        1
    ]);

};


/**
 * Create ramdom RC
 * @param {Camera} [cam]
 * @returns {RowCol}
 */
module.exports.getRandomRT = function(cam){

    cam = cam || DEFAULT_CAMERA;

    return {
        row: Math.random()*cam.height,
        col: Math.random()*cam.width
    };

};


//=======================================


/**
 * Generate random RGB color string like rgb(255,255,255)
 * @returns {string}
 */
module.exports.genRGBString = function(){

    return 'rgb(' + getInt() + ',' + getInt() + ',' + getInt() + ')';

    function getInt(){
        return Math.floor(255*Math.random());
    }

};


//=======================================


/**
 *
 * @param {Camera} [cam] - optional bounding camera
 * @returns {Feature}
 */
module.exports.getRandomFeature = function(cam){

    cam = cam || DEFAULT_CAMERA;

    return {

        row: Math.floor(cam.height * Math.random()),

        col: Math.floor(cam.width * Math.random()),

        vector: _.range(128).map(function(){
            return Math.floor(128*Math.random());
        })

    };

};


/**
 * Generate a random linear equation set
 * @param {Vector} [solve]
 * @param {int} [rows]
 * @return {Matrix}
 */
module.exports.getRandomLinearEquationSet = function(solve, rows){

    var cols;

    if (solve) {
        cols = solve.elements.length;
    }
    else {
        cols = 6 + Math.floor(10*Math.random());
        solve = Vector.Random(cols);
    }

    rows = rows || cols + 4 + Math.floor(10*Math.random());

    return Matrix.create(_.range(rows).map(function(){
        return module.exports.getRandomOrthogonalVector(solve).elements;
    }));

};


/**
 * V*V'=0
 * @param {Vector} v
 * @returns {Vector}
 */
module.exports.getRandomOrthogonalVector = function(v){

    var dims = v.elements.length,
        ind = Math.floor(dims*Math.random()),
        result = Vector.Random(dims),
        cursor,
        memo = 0;

    for (cursor=0; cursor<dims; cursor++) {
        if (cursor != ind) {
            memo += v.elements[cursor] * result.elements[cursor];
        }
    }

    result.elements[ind] = -memo/v.elements[ind];

    return result;

};