'use strict';

var Canvas = require('canvas'),
    Promise = require('promise');

var samples = require('../src/utils/samples.js'),
    derivatives = require('../src/math/derivatives.js'),
    testUtils = require('../src/utils/testing.js');


function promiseResult(path, img, func){
    var width = img.shape[1],
        height = img.shape[0];
    var canv = new Canvas(width, height),
        ctx = canv.getContext('2d'),
        imgdata = ctx.createImageData(width, height),
        buffer = imgdata.data;
    var row, col, pixel, cursor;
    for (row=0; row<height; row++) {
        for (col=0; col<width; col++) {
            cursor = 4 * (col + width * row);
            pixel = func(img, row, col);
            buffer[cursor] = pixel;
            buffer[cursor+1] = pixel;
            buffer[cursor+2] = pixel;
            buffer[cursor+3] = 255;
        }
    }
    ctx.putImageData(imgdata, 0, 0);
    return testUtils.promiseWriteCanvas(canv, path);
}


function test(index){
    samples.promiseImage(index)
        .then(function(img){
            return Promise.all([
                promiseResult('/home/sheep/Code/dx-image.png', img, derivatives.dx),
                promiseResult('/home/sheep/Code/dy-image.png', img, derivatives.dy),
                promiseResult('/home/sheep/Code/dxx-image.png', img, derivatives.dxx),
                promiseResult('/home/sheep/Code/dyy-image.png', img, derivatives.dyy),
                promiseResult('/home/sheep/Code/dxy-image.png', img, derivatives.dxy),
                promiseResult('/home/sheep/Code/dyx-image.png', img, derivatives.dyx)
            ]);
        });
}

test(2);