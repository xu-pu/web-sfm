var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric');

var sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    dlt = require('../src/webregister/estimate-projection.js'),
    lma = require('../src/math/levenberg-marquardt.js'),
    laUtils = require('../src/math/la-utils.js'),
    geoUtils = require('../src/math/geometry-utils.js'),
    decomposition = require('../src/math/matrix-decomposition.js');

function decView(i){
    var view = sample.getView(i),
        P = view.P,
        R = view.R,
        t = view.t,
        cam = view.cam,
        K = projections.getCalibrationMatrix(view.f, cam.width, cam.height);

    var results = decomposition.KRt(P),
        KKK = results.K,
        RRR = results.R,
        ttt = results.t;

    console.log(R.transpose().x(RRR).subtract(Matrix.I(3)).max());
    console.log(R.subtract(RRR).max());
    console.log(KKK.subtract(K).max());
    console.log(t.subtract(ttt).max());

}
decView(30);