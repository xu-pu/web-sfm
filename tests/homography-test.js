'use strict';

var Promise = require('promise'),
    saveimage = require('save-pixels'),
    grayscale = require('luminance'),
    fs = require('fs'),
    lena = require('lena'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var samples = require('../src/utils/samples.js'),
    homography = require('../src/webmvs/homography.js'),
    rectification = require('../src/webmvs/rectification.js'),
    testUtils = require('../src/utils/testing.js');

var TEST_ANGEL = Math.PI/6;

var testRotation = Matrix.create([
    [Math.cos(TEST_ANGEL), Math.sin(TEST_ANGEL), 0],
    [-Math.sin(TEST_ANGEL), Math.cos(TEST_ANGEL), 0],
    [0,0,1]
]);

testUtils.promiseSaveNdarray(lena, '/home/sheep/Code/writetest1.png');