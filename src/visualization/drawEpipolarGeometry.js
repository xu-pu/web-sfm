'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
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
        cam1 = config.cam1,
        cam2 = config.cam2;
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    _.range(30).map(function(){
        var p1 = cord.getRandomImgCord(cam1),
            p2 = cord.getRandomImgCord(cam2),
            line1 = cord.imgline2points(F.x(p2), cam1),
            line2 = cord.imgline2points(F.transpose().x(p1), cam2);
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