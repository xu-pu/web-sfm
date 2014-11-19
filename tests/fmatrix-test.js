'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Promise = require('promise'),
    Canvas = require('canvas');

var projections = require('../src/math/projections.js'),
    samples = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    eightpoint = require('../src/webregister/eightpoint.js'),
    fmatrixError = eightpoint.fundamentalMatrixError,
    drawImagePair = require('../src/visualization/drawImagePair.js'),
    drawDetailedMatch = require('../src/visualization/drawDetailedMatch.js');

function filterMatches(i1,i2){
    var THRESHOLD = 1;
    var features1 = samples.getFeatures(i1),
        features2 = samples.getFeatures(i2),
        data = samples.getTwoView(i1, i2),
        fmatrix = projections.getFundamentalMatrix(data.R1, data.t1, data.f1, data.cam1, data.R2, data.t2, data.f2, data.cam2),
        matches = samples.getRawMatches(i1, i2),
        metadata = {
            features1: features1,
            features2: features2,
            cam1: data.cam1,
            cam2: data.cam2
        };
    var filtered = matches.filter(function(match){
        return fmatrixError(fmatrix, match, metadata) < THRESHOLD;
    });

    console.log(filtered.length + '/' + matches.length + ' left.');

    return Promise.all([
        testUtils.promiseVisualMatch('/home/sheep/Code/matches.png', i1, i2, matches),
        testUtils.promiseVisualMatch('/home/sheep/Code/matches-filtered.png', i1, i2, filtered),
        testUtils.promiseVisualEpipolar('/home/sheep/Code/matches-fmatrix.png', i1, i2, fmatrix)
    ]);

}

function getFmatrix(i1, i2){
    var data = samples.getTwoView(i1, i2),
        fmatrix = projections.getFundamentalMatrix(data.R1, data.t1, data.f1, data.cam1, data.R2, data.t2, data.f2, data.cam2);
    testUtils.promiseVisualEpipolar('/home/sheep/Code/visual-fmatrix.png', i1, i2, fmatrix)
}


function promiseVisualMatch(i1, i2){
    var data = samples.getTwoView(i1, i2),
        matches = samples.getRawMatches(i1, i2),
        fmatrix = projections.getFundamentalMatrix(data.R1, data.t1, data.f1, data.cam1, data.R2, data.t2, data.f2, data.cam2);
    return Promise.all([
        samples.promiseCanvasImage(i1),
        samples.promiseCanvasImage(i2)
    ]).then(function(results){
        var canv = new Canvas(),
            config = drawImagePair(results[0], results[1], canv, 800),
            ctx = canv.getContext('2d'),
            features1 = samples.getFeatures(i1),
            features2 = samples.getFeatures(i2);
        ['red', 'blue', 'yellow', 'green', 'black', 'orange', 'purple', 'gray', 'white'].forEach(function(color){
            var index = Math.floor(Math.random() * matches.length);
            drawDetailedMatch(ctx, config, fmatrix, matches[index], color, features1, features2, data.cam1, data.cam2);
        });
        return testUtils.promiseWriteCanvas(canv, '/home/sheep/Code/visual-detailed-fmatrix.png');
    });
}


filterMatches(3,8);
//getFmatrix(20,21);
//promiseVisualMatch(4,5);