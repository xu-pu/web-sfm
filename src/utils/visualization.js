var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    cord = require('./cord.js');

module.exports.drawImagePair = drawImagePair;
module.exports.drawMatches = drawMatches;

function drawImagePair(img1, img2, canvas, fixedWidth){
    var PADDING = 10;
    var ratioX = img1.height/img1.width + img2.height/img2.width;
    var ratioY = img1.width/img1.height + img2.width/img2.height;
    var alignX = (ratioX>1 ? ratioX : 1/ratioX) <= (ratioY>1 ? ratioY : 1/ratioY);
    var ratio1 = alignX ? fixedWidth/img1.width : (fixedWidth/ratioY)/img1.height,
        ratio2 = alignX ? fixedWidth/img2.width : (fixedWidth/ratioY)/img2.height;

    canvas.width = fixedWidth;
    canvas.height = alignX ? ratioX*fixedWidth : fixedWidth/ratioY;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img1, 0, 0, img1.width*ratio1, img1.height*ratio1);
    if (alignX) {
        ctx.drawImage(img2, 0, img1.height*ratio1+PADDING, img2.width*ratio1, img2.height*ratio1);
    }
    else {
        ctx.drawImage(img2, img1.width*ratio1+PADDING, 0, img2.width*ratio1, img2.height*ratio1);
    }

    var offsetX, offsetY;
    if (alignX) {
        offsetX = 0;
        offsetY = img1.height * ratio1 + PADDING;
    }
    else {
        offsetX = img1.width * ratio1 + PADDING;
        offsetY = 0;
    }

    return {
        alignX: alignX,
        ratio1: ratio1,
        ratio2: ratio2,
        padding: PADDING,
        offsetX: offsetX,
        offsetY: offsetY,
        cam1: { width: img1.width, height: img1.height },
        cam2: { width: img2.width, height: img2.height }
    };

}


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

function drawEpipolarGeometry(ctx, data, matches, F, config){
    var features1 = data.features1,
        features2 = data.features2;
    matches.forEach(function(match){
        var f1 = features1[match[0]],
            f2 = features2[match[1]],
            p1 = cord.RCtoImg(f1.row, f1.col),
            p2 = cord.RCtoImg(f2.row, f2.col),
            l1 = F.x(Vector.create(p2)),
            l2 = Matrix.create([p1]).x(F).row(1);
        drawHomoLine(ctx, l1, config, true);
        drawHomoLine(ctx, l2, config, false);
    });
}


function drawHomoLine(ctx, line, config, isFirst){

}