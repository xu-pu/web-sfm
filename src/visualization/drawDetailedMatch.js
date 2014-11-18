'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var cord = require('../utils/cord.js');

/**
 * @param ctx
 * @param {TwoImageConfig} config
 * @param F
 * @param {int[]} match
 * @param {string} color
 * @param {Feature[]} features1
 * @param {Feature[]} features2
 * @param {Camera} cam1
 * @param {Camera} cam2
 */
module.exports = function(ctx, config, F, match, color, features1, features2, cam1, cam2){
    var f1 = features1[match[0]],
        f2 = features2[match[1]],
        p1 = Vector.create(cord.featureToImg(f1, cam1)),
        p2 = Vector.create(cord.featureToImg(f2, cam2)),
        line1 = cord.imgline2points(F.x(p2), cam1),
        line2 = cord.imgline2points(F.transpose().x(p1), cam2);
    if (line1.length === 2 && line2.length === 2) {
//        console.log(color);
//        console.log(line1);
//        console.log(line2);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.moveTo(line1[0].col*config.ratio1, line1[0].row*config.ratio1);
        ctx.lineTo(line1[1].col*config.ratio1, line1[1].row*config.ratio1);
        ctx.moveTo(line2[0].col*config.ratio2+config.offsetX, line2[0].row*config.ratio2+config.offsetY);
        ctx.lineTo(line2[1].col*config.ratio2+config.offsetX, line2[1].row*config.ratio2+config.offsetY);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        drawPoint(ctx, config.ratio1*f1.col, config.ratio1*f1.row);
        drawPoint(ctx, config.offsetX+config.ratio2*f2.col, config.offsetY+config.ratio2*f2.row);
        ctx.stroke();
    }
};


function drawPoint(ctx, x, y){
    var markSize = 5;
    ctx.moveTo(x-markSize, y);
    ctx.lineTo(x+markSize, y);
    ctx.moveTo(x, y-markSize);
    ctx.lineTo(x, y+markSize);
}