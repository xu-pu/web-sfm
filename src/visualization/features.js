'use strict';

var _ = require('underscore');


/**
 *
 * @param ctx
 * @param buffer - ndarray
 * @param {number} offsetX
 * @param {number} offsetY
 * @param {number} [scale]
 * @param [options]
 */
exports.fromBuffer = function(ctx, buffer, offsetX, offsetY, scale, options){
    scale = scale || 1;
    options = options || {};
    _.defaults(options, {
        color: 'red',
        markSize: 3
    });
    ctx.beginPath();
    ctx.strokeStyle = options.color;
    ctx.lineWidth = options.markSize/2;
    var length = buffer.shape[0],
        cursor, x, y;
    for (cursor=0; cursor<length; cursor++) {
        x = offsetX + scale*buffer.get(cursor, 1);
        y = offsetY + scale*buffer.get(cursor, 0);
        ctx.moveTo(x-options.markSize, y);
        ctx.lineTo(x+options.markSize, y);
        ctx.moveTo(x, y-options.markSize);
        ctx.lineTo(x, y+options.markSize);
    }
    ctx.stroke();
};

exports.fromRC = function(ctx, features, offsetX, offsetY, scale, options){
    options = options || {};
    _.defaults(options, {
        color: 'red',
        markSize: 3
    });
    ctx.beginPath();
    ctx.strokeStyle = options.color;
    ctx.lineWidth = options.markSize/2;
    features.forEach(function(feature){
        var x = offsetX + scale*feature.col,
            y = offsetY + scale*feature.row;
        ctx.moveTo(x-options.markSize, y);
        ctx.lineTo(x+options.markSize, y);
        ctx.moveTo(x, y-options.markSize);
        ctx.lineTo(x, y+options.markSize);
    });
    ctx.stroke();
};