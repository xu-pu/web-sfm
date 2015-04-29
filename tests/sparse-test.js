var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var laUtils = require('../src/math/la-utils.js'),
    genUtils = require('../src/utils/random-test-utils.js'),
    sba = require('../src/webregister/sparse-bundle-adjustment.js'),
    sparse = require('../src/math/sparse-matrix.js'),
    SparseMatrix = sparse.SparseMatrix;

var CAM_PARAMS = 11;
var POINT_PARAMS = 3;

var sampleM = [
    [1,2,3,4,5],
    [1,2,0,4,5],
    [1,2,0,0,5],
    [1,2,3,0,5]
];