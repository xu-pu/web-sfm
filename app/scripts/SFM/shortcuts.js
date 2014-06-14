'use strict';

function getLocalStorage(key){
    var result = localStorage.getItem(key);
    if (result === null) {
        return null;
    }
    else {
        return JSON.parse(result);
    }
}

function setLocalStorage(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}


function getImageData(img){
    var canvas = document.createElement('canvas');
    canvas.height = img.height;
    canvas.width = img.width;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0,0,canvas.width, canvas.height);
}



function drawSift(ctx, img, features){
    var signSize = 3;
    _.forEach(features, function(feature){
        var x, y;
        if (feature.point) {
            x = feature.point.x*ctx.canvas.width/img.width;
            y = (img.height+1-feature.point.y)*ctx.canvas.height/img.height;
        }
        else if (feature.col && feature.row){
            x = feature.col*ctx.canvas.width/img.width;
            y = feature.row*ctx.canvas.height/img.height;
        }
        else {
            console.log(feature);
            throw 'feature invalid';
        }
        ctx.moveTo(x-signSize, y);
        ctx.lineTo(x+signSize, y);
        ctx.moveTo(x, y-signSize);
        ctx.lineTo(x, y+signSize);
    });
    ctx.stroke();
}


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


function drawTwoViewMatches(img1, img2, features1, features2, matches){
    var fixedWidth = 600;
    var ratio1 = fixedWidth/img1.width,
        ratio2 = fixedWidth/img2.width,
        height1 = img1.height*ratio1,
        height2 = img2.height*ratio2;
    var canvas = document.createElement('canvas');
    canvas.width = fixedWidth;
    canvas.height = height1+height2;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img1, 0, 0, fixedWidth, height1);
    ctx.drawImage(img2, 0, height1, fixedWidth, height2);

    drawFeatures(ctx, _.map(matches, function(match){
        return features1[match[0]];
    }), 0, 0, img1.height, ratio1);

    drawFeatures(ctx, _.map(matches, function(match){
        return features2[match[1]];
    }), 0, ratio1*img1.height, img2.height, ratio2, { color: 'green' });

    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    matches.forEach(function(match){
        var row1 = features1[match[0]].row,
            col1 = features1[match[0]].col,
            row2 = features2[match[1]].row,
            col2 = features2[match[1]].col;
        var x1 = ratio1*col1,
            y1 = ratio1*(img1.height-1-row1),
            x2 = ratio2*col2,
            y2 = ratio2*(img2.height-1-row2)+height1;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    });
    ctx.stroke();
}

function compareFeatures(img, features1, features2){
    var PADDING = 10;
    var fixedWidth = 600;
    var ratio = fixedWidth/img.width;
    var height = img.height*ratio;

    var offset = fixedWidth+PADDING;

    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = PADDING + 2 * fixedWidth;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, fixedWidth, height);
    ctx.drawImage(img, offset, 0, fixedWidth, height);

    drawFeatures(ctx, features1, 0, 0, ratio);
    drawFeatures(ctx, features2, offset, 0, ratio);

}


/**
 *
 */
function drawGrayscale(gray){


}