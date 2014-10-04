'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var cord = require('../utils/cord.js');

/**
 * @param {TwoImageConfig} config
 * @param ctx
 * @param F
 */
module.exports = function(config, ctx, F){
    var offsetX = config.offsetX,
        offsetY = config.offsetY,
        ratio1 = config.ratio1,
        ratio2 = config.ratio2,
        img1 = config.cam1,
        img2 = config.cam2;
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    matches.map(function(match){
        var f1 = features1[match[0]],
            f2 = features2[match[1]],
            p1 = Vector.create(cord.featureToImg(f1, img1)),
            p2 = Vector.create(cord.featureToImg(f2, img2)),
            line1 = cord.imgline2points(F.x(p2), img1.width, img1.height),
            line2 = cord.imgline2points(F.transpose().x(p1), img2.width, img2.height);
        if (line1.length === 2) {
            ctx.moveTo(line1[0].col*ratio1, line1[0].row*ratio1);
            ctx.lineTo(line1[1].col*ratio1, line1[1].row*ratio1);
        }
        if (line2.length === 2) {
            ctx.moveTo(line2[0].col*ratio2+offsetX, line2[0].row*ratio2+offsetY);
            ctx.lineTo(line2[1].col*ratio2+offsetX, line2[1].row*ratio2+offsetY);
        }
    });
    ctx.stroke();
};