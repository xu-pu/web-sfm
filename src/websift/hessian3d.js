'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports = function(space, row, col, layer){

    var v = space.get(row, col, layer);

    var dxx = ( space.get(row, col+1, layer) + space.get(row, col-1, layer) - 2 * v );

    var dyy = ( space.get(row+1, col, layer) + space.get(row-1, col, layer) - 2 * v );

    var dss = ( space.get(row, col, layer+1) + space.get(row, col, layer-1) - 2 * v );

    var dxy = (
        space.get(row+1, col+1, layer) -
        space.get(row+1, col-1, layer) -
        space.get(row-1, col+1 ,layer) +
        space.get(row-1, col-1, layer) ) / 4.0;

    var dxs = (
        space.get(row, col+1, layer+1) -
        space.get(row, col-1, layer+1) -
        space.get(row, col+1 ,layer-1) +
        space.get(row, col-1, layer-1) ) / 4.0;

    var dys = (
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