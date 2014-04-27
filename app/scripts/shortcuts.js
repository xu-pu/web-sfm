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

function getBundler(){

}

function getMVS(){}

function renderSIFT(){}

function renderSparse(canvas, points, cameras) {

    var shape1, shape2, model, scene, context;

    model = seen.Models.default();

    shape1 = seen.Shapes.tetrahedron();
    shape2 = seen.Shape('my shape', [new seen.Shapes.Surface([
        seen.P(0,0,0),
        seen.P(0,1,0),
        seen.P(1,0,0)
    ])]);
    model.add(shape2);

    scene = new seen.Scene({
        model: model,
        camera: new seen.Camera({
            viewport: seen.Viewports.center(),
            projection: seen.Projections.perspective()
        })
    });

    context = seen.Context(canvas);
    context.sceneLayer(scene);
    context.render();

    context = seen.Context(canvas, scene);
    context.render();

}

function renderDense(points, cameras){}


function webglTest(){

    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var gl = canvas.getContext('experimental-webgl');

    var VERTEX = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VERTEX);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    gl.flush();

}