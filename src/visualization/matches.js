'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var drawFeatures = require('./features.js').fromBuffer;
var cord = require('../utils/cord.js');

//=============================================================

/**
 * @typedef  {{alignX: boolean, ratio1: number, ratio2: number, padding: number, offsetX: number, offsetY: number, cam1: Camera, cam2: Camera}} TwoImageConfig
 */

/**
 * @param img1
 * @param img2
 * @param canvas
 * @param fixedWidth
 * @returns {TwoImageConfig}
 */
exports.drawImagePair = function(img1, img2, canvas, fixedWidth){
    var PADDING = 10;
    var heightV = img1.height/img1.width + img2.height/img2.width;
    var widthH = img1.width/img1.height + img2.width/img2.height;
    var alignV = (heightV>1 ? heightV : 1/heightV) <= (widthH>1 ? widthH : 1/widthH);
    var ratio1 = alignV ? fixedWidth/img1.width : ((fixedWidth-PADDING)/widthH)/img1.height,
        ratio2 = alignV ? fixedWidth/img2.width : ((fixedWidth-PADDING)/widthH)/img2.height;

    canvas.width = fixedWidth;
    canvas.height = alignV ? heightV*fixedWidth : fixedWidth/widthH;

    var width1 = img1.width*ratio1,
        height1 = img1.height*ratio1,
        width2 = img2.width*ratio2,
        height2 = img2.height*ratio2;

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img1, 0, 0, width1, height1);
    if (alignV) {
        ctx.drawImage(img2, 0, height1+PADDING, width2, height2);
    }
    else {
        ctx.drawImage(img2, width1+PADDING, 0, width2, height2);
    }

    var offsetX, offsetY;
    if (alignV) {
        offsetX = 0;
        offsetY = img1.height * ratio1 + PADDING;
    }
    else {
        offsetX = img1.width * ratio1 + PADDING;
        offsetY = 0;
    }

    return {
        alignX: alignV,
        ratio1: ratio1,
        ratio2: ratio2,
        padding: PADDING,
        offsetX: offsetX,
        offsetY: offsetY,
        cam1: { width: img1.width, height: img1.height },
        cam2: { width: img2.width, height: img2.height }
    };

};

/**
 *
 * @param {TwoImageConfig} config
 * @param ctx
 * @param {int[][]} matches
 * @param features1 - ndarray
 * @param features2 - ndarray
 */
exports.drawMatches = function(config, ctx, matches, features1, features2){
    var offsetX = config.offsetX,
        offsetY = config.offsetY;
    drawFeatures(ctx, features1, 0, 0, config.ratio1);
    drawFeatures(ctx, features2, offsetX, offsetY, config.ratio2, { color: 'green' });
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    matches.forEach(function(match){
        var i1 = match[0],
            i2 = match[1],
            row1 = features1.get(i1, 0),
            col1 = features1.get(i1, 1),
            row2 = features2.get(i2, 0),
            col2 = features2.get(i2, 1),
            x1 = config.ratio1*col1,
            y1 = config.ratio1*row1,
            x2 = config.ratio2*col2 + offsetX,
            y2 = config.ratio2*row2 + offsetY;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    });
    ctx.stroke();
};


/**
 * @param ctx
 * @param {TwoImageConfig} config
 * @param {Matrix} F
 * @param {RowCol[]} pair
 * @param {string} color
 * @param {Camera} cam1
 * @param {Camera} cam2
 */
exports.drawDetailedMatches = function(ctx, config, F, pair, color, cam1, cam2){

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