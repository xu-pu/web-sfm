var ndarray = require('ndarray'),
    imgshow = require('ndarray-imshow'),
    grayscale = require('luminance');

module.exports.imagedata2ndarray = imagedata2ndarray;
module.exports.canvas2ndarray = canvas2ndarray;
module.exports.showNodeCanvas = showNodeCanvas;

function imagedata2ndarray(imagedata){
    return ndarray(imagedata.data, [imagedata.height, imagedata.width, 4]);
}


function canvas2ndarray(ctx, width, height){
    var imagedata = ctx.getImageData(0, 0, width, height);
    return imagedata2ndarray(imagedata);
}

function showNodeCanvas(canvas){
    var ctx = canvas.getContext('2d');
    var arr = canvas2ndarray(ctx, canvas.width, canvas.height);
    imgshow(grayscale(arr));
}

function img2ImageData(img){
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
}