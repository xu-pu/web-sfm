var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric'),
    pool = require('ndarray-scratch');

var matcher = require('../src/webmatcher/matcher.js'),
    tracking = require('../src/webmatcher/tracking.js'),
    VisibilityGraph = require('../src/webmatcher/tracking.js').VisibilityGraph,
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    dlt = require('../src/webregister/estimate-projection.js'),
    lma = require('../src/math/nonlinear.js').lma,
    estF = require('../src/webregister/estimate-fmatrix.js'),
    laUtils = require('../src/math/la-utils.js'),
    geoUtils = require('../src/math/geometry-utils.js'),
    decomposition = require('../src/math/matrix-decomposition.js'),
    triangulation = require('../src/webregister/triangulation.js'),
    register = require('../src/webregister/register.js'),
    sba = require('../src/math/sparse-bundle-adjustment.js'),
    RegisterContext = register.RegisterContext;

function mytestfunc(x){
    var v1 = x.e(1), v2 = x.e(2), v3 = x.e(3);
    return laUtils.toVector([3*v1*v1*v2, -5*v1*v2*v3+5, v3*v3*v1/2]);
}

var xx = laUtils.toVector([3,4,5]),
    x0 = xx.add(Vector.Random(3).x(2)),
    y0 = mytestfunc(xx);

var result = lma(mytestfunc, x0, y0);

console.log(result);
