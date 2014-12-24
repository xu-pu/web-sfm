'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

//===============================================================


/**
 * Get Hessian Matrix of a integral point in DoG space
 * @param {DogPyramid} space
 * @param {int} row
 * @param {int} col
 * @param {int} layer
 * @return {Matrix}
 */
module.exports = function(space, row, col, layer){

    var v   = space.get(row, col, layer),
        dxx = ( space.get(row, col+1, layer) + space.get(row, col-1, layer) - 2 * v ),
        dyy = ( space.get(row+1, col, layer) + space.get(row-1, col, layer) - 2 * v ),
        dss = ( space.get(row, col, layer+1) + space.get(row, col, layer-1) - 2 * v ),
        dxy = (
            space.get(row+1, col+1, layer) -
            space.get(row+1, col-1, layer) -
            space.get(row-1, col+1 ,layer) +
            space.get(row-1, col-1, layer) ) / 4.0,
        dxs = (
            space.get(row, col+1, layer+1) -
            space.get(row, col-1, layer+1) -
            space.get(row, col+1 ,layer-1) +
            space.get(row, col-1, layer-1) ) / 4.0,
        dys = (
            space.get(row+1, col, layer+1) -
            space.get(row-1, col, layer+1) -
            space.get(row+1, col ,layer-1) +
            space.get(row-1, col, layer-1) ) / 4.0;

    return Matrix.create([
        [dxx, dxy, dxs],
        [dxy, dyy, dys],
        [dxs, dys, dss]
    ]);

};