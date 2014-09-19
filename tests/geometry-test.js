'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Canvas = require('canvas');

var bundler = require('../src/math/bundler.js'),
    sample = require('../src/utils/samples.js'),
    drawFeatures = require('../src/visualization/drawFeatures.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js');


function testCam(index){

    var cam = sample.getCamera(index),
        Rt = bundler.getStandardRt(Matrix.create(cam.R), Vector.create(cam.t)),
        R = Rt.R,
        t = Rt.t,
        focal = cam.focal;

    return sample
        .promiseCanvasImage(index)
        .then(function(img){
            var projector = projections.getProjectionMatrix(R, t, focal, img.width, img.height);
            var points = sample.sparse.map(function(p){
                var X = Vector.create([p.point[0], p.point[1], p.point[2], 1]);
                var x = projector.x(X);
                return cord.img2RT(x, img.height);
            });
            var canv = new Canvas();
            canv.width = img.width;
            canv.height = img.height;
            var ctx = canv.getContext('2d');
            ctx.drawImage(img, 0, 0);
            drawFeatures(ctx, points, 0, 0, 1, {markSize: 10});
            return testUtils.promiseWriteCanvas(canv, '/home/sheep/Code/geo.png')
        });

}

//testCam(7);

var cam = sample.getCamera(3);
var R = Matrix.create(cam.R);
var t = Vector.create(cam.t);
var Rt = bundler.getStandardRt(R,t);
var o = R.transpose().x(t).x(-1);
var v1 = toworld(R, t, Vector.create([0,0,1]));
var v2 = toworld(Rt.R, Rt.t, Vector.create([0,0,1]));

console.log(v1.subtract(o));
console.log(v2.subtract(o));

function toworld(R, t, P){
    return R.transpose().x(P.subtract(t));
}