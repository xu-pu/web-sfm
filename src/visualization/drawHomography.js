'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    interp = require("ndarray-linear-interpolate").d2;


var cord = require('../utils/cord.js');


module.exports = function(image, H, ctx, offsetX, offsetY, ratio){

    var height = image.shape[1],
        width = image.shape[0],
        rows = Math.floor(height*ratio),
        cols = Math.floor(width*ratio),
        canvCam = { width: cols, height: rows },
        buffer = ctx.createImageData(cols, rows),
        ratioTransform = Matrix.create([
            [1/ratio, 0      , 0],
            [0      , 1/ratio, 0],
            [0      , 0      , 1]
        ]),
        HH = H.inverse().x(ratioTransform);

    var row, col, color, cursor;
    for (row=0; row<rows; row++) {
        for (col=0; col<cols; col++) {
            cursor = (row*cols+col) * 4;
            color = getPointColor();
            buffer.data[cursor] = color;
            buffer.data[cursor+1] = color;
            buffer.data[cursor+2] = color;
            buffer.data[cursor+3] = 255;
        }
    }

    ctx.putImageData(buffer, offsetX, offsetY);

    function getPointColor(){
        var p = Vector.create(cord.RCtoImg(row, col, canvCam)),
            P = HH.x(p),
            sample = cord.img2RT(P, height);
        if (sample.row >=0 && sample.col >=0 && sample.row < height && sample.col < width) {
            return interp(image, sample.col, sample.row);
        }
        else {
            return 0;
        }
    }

};