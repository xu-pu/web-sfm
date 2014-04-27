'use strict';

/**
 *
 * @param {Image} img
 * @returns {CanvasRenderingContext2D}
 */
function getCanvas(img){
    var canvas = document.createElement('canvas');
    canvas.height = img.height;
    canvas.width = img.width;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    document.body.appendChild(canvas);
    return ctx;
}

/**
 * @param {Grayscale} img
 */
function showGrayscale(img) {
    var canvas = document.createElement('canvas');
    canvas.height = img.height;
    canvas.width = img.width;
    var ctx = canvas.getContext('2d');
    var data = ctx.createImageData(img.width, img.height);
    var row, col, offset;
    for (row=0; row<img.height; row++) {
        for (col=0; col<img.width; col++) {
            offset = 4*(row*img.width+col);
            data.data[offset] = img.data[row][col];
            data.data[offset+1] = img.data[row][col];
            data.data[offset+2] = img.data[row][col];
            data.data[offset+3] = 255;
        }
    }
    ctx.putImageData(data, 0, 0);
    document.body.appendChild(canvas);
}


function getGLCanvas(){

}

/**
 *
 * @param {string} imageName
 * @param {function} callback
 */
function getSiftSample(imageName, callback) {
    $.getJSON('/dataset/sift.json/'+imageName+'.json').done(callback);
}

function getBundlerSample(){


}