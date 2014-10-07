'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    interp = require("ndarray-linear-interpolate").d2;


var cord = require('../utils/cord.js');

module.exports = function(image, H, ctx, offsetX, offsetY, ratio){

    var width = image.shape[1],
        height = image.shape[0],
        rows = Math.floor(height*ratio),
        cols = Math.floor(width*ratio),
        cam = { width: width, height: height },
        canvCam = { width: cols, height: rows },
        buffer = ctx.createImageData(cols, rows),
        HH = H.inverse(),
        ratioTransform = Matrix.create([
            [1/ratio, 0      , 0],
            [0      , 1/ratio, 0],
            [0      , 0      , 1]
        ]);

    var row, col, color, cursor;
    for (row=0; row<rows; row++) {
        for (col=0; col<cols; col++) {
            cursor = (row*cols+col) * 4;
            color = getPointColor();
            buffer.data[cursor] = color;
            buffer.data[cursor+1] = color;
            buffer.data[cursor+2] = color;
            buffer.data[cursor+3] = 1;
        }
    }

    ctx.putImageData(buffer, offsetX, offsetY);

    function getPointColor(){
        var p = Vector.create(cord.RCtoImg(row, col, canvCam)),
            P = ratioTransform.x(p),
            PP = HH.x(P),
            sample = cord.img2RT(PP, height);
        if (sample.row >=0 && sample.col >=0 && sample.row < height && sample.col < width) {
            return interp(image, sample.row, sample.col);
        }
        else {
            return 0;
        }
    }

};