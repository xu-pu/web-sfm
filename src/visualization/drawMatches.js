'use strict';

var drawFeatures = require('./drawFeatures.js');

module.exports = drawMatches;

function drawMatches(config, ctx, matches, features1, features2){
    var offsetX = config.offsetX,
        offsetY = config.offsetY;
    drawFeatures(ctx, features1, 0, 0, config.ratio1);
    drawFeatures(ctx, features2, offsetX, offsetY, config.ratio1, { color: 'green' });
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    matches.forEach(function(match){
        var row1 = features1[match[0]].row,
            col1 = features1[match[0]].col,
            row2 = features2[match[1]].row,
            col2 = features2[match[1]].col;
        var x1 = config.ratio1*col1,
            y1 = config.ratio1*row1,
            x2 = config.ratio2*col2 + offsetX,
            y2 = config.ratio2*row2 + offsetY;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    });
    ctx.stroke();
}
