module.exports.drawFeatures = drawFeatures;
module.exports.drawImagePair = drawImagePair;
module.exports.drawMatches = drawMatches;


function drawFeatures(ctx, features, offsetX, offsetY, scale, options){
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
}


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

    return {
        alignX: alignX,
        ratio1: ratio1,
        ratio2: ratio2,
        padding: PADDING,
        cam1: { width: img1.width, height: img1.height },
        cam2: { width: img2.width, height: img2.height }
    };

}


function drawMatches(config, ctx, matches, features1, features2){
    var offsetX, offsetY;
    if (config.alignX) {
        offsetX = 0;
        offsetY = config.cam1.height*config.ratio1 + config.padding;
    }
    else {
        offsetX = config.cam1.width*config.ratio1 + config.padding;
        offsetY = 0;
    }
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