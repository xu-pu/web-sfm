'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var cord = require('../utils/cord.js');

/**
 * @param ctx
 * @param {TwoImageConfig} config
 * @param {Matrix} F
 * @param {RowCol[]} pair
 * @param {string} color
 * @param {Camera} cam1
 * @param {Camera} cam2
 */
module.exports = function(ctx, config, F, pair, color, cam1, cam2){

    var f1 = pair[0],
        f2 = pair[1],
        p1 = cord.rc2x(f1),
        p2 = cord.rc2x(f2),
        line1 = cord.imgline2points(F.x(p2), cam1),
        line2 = cord.imgline2points(F.transpose().x(p1), cam2);
    if (line1.length === 2 && line2.length === 2) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(line1[0].col*config.ratio1, line1[0].row*config.ratio1);
        ctx.lineTo(line1[1].col*config.ratio1, line1[1].row*config.ratio1);
        ctx.moveTo(line2[0].col*config.ratio2+config.offsetX, line2[0].row*config.ratio2+config.offsetY);
        ctx.lineTo(line2[1].col*config.ratio2+config.offsetX, line2[1].row*config.ratio2+config.offsetY);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        drawPoint(ctx, config.ratio1*f1.col, config.ratio1*f1.row);
        drawPoint(ctx, config.offsetX+config.ratio2*f2.col, config.offsetY+config.ratio2*f2.row);
        ctx.stroke();
    }
};


function drawPoint(ctx, x, y){
    var markSize = 7;
    ctx.moveTo(x-markSize, y);
    ctx.lineTo(x+markSize, y);
    ctx.moveTo(x, y-markSize);
    ctx.lineTo(x, y+markSize);
}