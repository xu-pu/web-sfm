'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var sample = require('../src/utils/samples.js'),
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
        reR = geoUtils.getRotationFromEuler(angles[0], angles[1], angles[2]),
        errorMatrix = refer.transpose().x(reR).subtract(Matrix.I(3));

    console.log('error matrix infinite norm: ' + laUtils.matrixInfiniteNorm(errorMatrix));

}


function testCam(i){

    var refer = Matrix.create(sample.getCamera(i).R),
        angles = geoUtils.getEulerAngles(refer),
        reR = geoUtils.getRotationFromEuler(angles[0], angles[1], angles[2]),
        reAngle = geoUtils.getEulerAngles(reR),
        diff = reR.x(refer.transpose()),
        diffAngle = geoUtils.getEulerAngles(diff);

    var referError = refer.transpose().x(refer).subtract(Matrix.I(3)),
        reRError = reR.transpose().x(reR).subtract(Matrix.I(3)),
        diffError = diff.subtract(Matrix.I(3));

    console.log('refer error matrix infinite norm: ' + laUtils.matrixInfiniteNorm(referError));
    console.log('reR error matrix infinite norm: ' + laUtils.matrixInfiniteNorm(reRError));
    console.log('diff error matrix infinite norm: ' + laUtils.matrixInfiniteNorm(diffError));

}

function cordFrameTest(i){

    var refer = sample.getView(i).R,
        RR = refer.transpose(),
        angles = geoUtils.getEulerAngles(refer),
        reR = geoUtils.getRotationFromEuler(angles[0], angles[1], angles[2]),
        reRR = reR.transpose();

    var x = Vector.create([1,0,0]),
        y = Vector.create([0,1,0]),
        z = Vector.create([0,0,1]);

    var X = RR.x(x), Y = RR.x(y), Z = RR.x(z);
    var XX = reRR.x(x), YY = reRR.x(y), ZZ = reRR.x(z);

    console.log(X.subtract(XX));
    console.log(Y.subtract(YY));
    console.log(Z.subtract(ZZ));

    console.log(refer.det());
    console.log(reR.det());
    //console.log(.det());
}


var halfpi = Math.PI/ 2,
    pi = Math.PI;

//testAngles(0.4+pi/2, 1.2+pi/2, 2.4+pi/2);
//testAngles(0.4, 1.2, 2.4);
//testAngles(1,5,6);

testCam(21);

//cordFrameTest(20);