'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var bundler = require('../src/math/bundler.js'),
    sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    dlt = require('../src/webregister/estimate-projection.js'),
    lma = require('../src/math/levenberg-marquardt.js'),
    laUtils = require('../src/math/la-utils.js'),
    geoUtils = require('../src/math/geometry-utils.js');


function testAngles(a, b,c){

    var refer = geoUtils.getRotationFromEuler(a,b,c),
        angles = geoUtils.getEulerAngles(refer),
        reR = geoUtils.getRotationFromEuler(angles[0], angles[1], angles[2]);

    console.log(refer.transpose().x(reR));

}


function testCam(i){

    var cam = sample.getView(i),
        referR = cam.R,
        angles = geoUtils.getEulerAngles(referR),
        reR = geoUtils.getRotationFromEuler(angles[0], angles[1], angles[2]);

    console.log(referR.transpose().x(reR));

}

//testAngles(4.1, 3.5, 3.7);

testCam(10);