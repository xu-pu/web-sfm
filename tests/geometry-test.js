'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var bundler = require('../src/math/bundler.js'),
    sample = require('../src/utils/samples.js'),
    Canvas = require('canvas');

function testCam(index){
    var cam = sample.getCamera(index);
    return sample.promiseCanvasImage(function(img){
        var canv = new Canvas(),
            ctx = canv.getContext('2d');


    });
}

function getVisiblePoints(index){

}