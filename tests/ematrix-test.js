'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    numeric = require('numeric'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var sample = require('../src/utils/samples.js'),
    projections = require('../src/math/projections.js'),
    testUtils = require('../src/utils/testing.js'),
    laUtils = require('../src/math/la-utils.js'),
    decompositions = require('../src/webregister/decompositions.js'),
    cord = require('../src/utils/cord.js');


function testCam(i1, i2){

    var data = sample.getTwoView(i1, i2),
        E = projections.getEssentialMatrix(data.R1, data.t1, data.R2, data.t2),
        Rt = projections.getRelativePose(data.R1, data.t1, data.R2, data.t2),
        Rr = Rt.R.transpose(),
        t = Rt.t.toUnitVector();

    var results = decompositions.ematrix2Rt(E),
        ta = results.ta,
        tb = results.tb,
        Ra = results.Ra,
        Rb = results.Rb;

    var taError = laUtils.vectorInfiniteNorm(ta.subtract(t)),
        tbError = laUtils.vectorInfiniteNorm(tb.subtract(t)),
        raError = laUtils.matrixInfiniteNorm(Rr.x(Ra).subtract(Matrix.I(3))),
        rbError = laUtils.matrixInfiniteNorm(Rr.x(Rb).subtract(Matrix.I(3)));

    console.log(taError);
    console.log(tbError);
    console.log(raError);
    console.log(rbError);

}

testCam(5,8);