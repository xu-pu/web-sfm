'use strict';

var THREE = require('three');

var bundler = require('../math/bundler.js'),
    getCameraFrame = require('./getCameraFrame.js'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var imgWidth=2000, imgHeight=3000;

module.exports = function(cam){
    var Rt = bundler.getStandardRt(Matrix.create(cam.R), Vector.create(cam.t)),
        R = Rt.R, t = Rt.t;
    return getCameraFrame(R, t, cam.focal, imgWidth, imgHeight);
};