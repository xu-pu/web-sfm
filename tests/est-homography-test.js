'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var sample = require('../src/utils/samples.js'),
    projections = require('../src/math/projections.js'),
    geoUtils = require('../src/math/geometry-utils.js'),
    testUtils = require('../src/utils/testing.js'),
    cord = require('../src/utils/cord.js'),
    estHomography = require('../src/webregister/estimate-homography.js'),
    estFmatrix = require('../src/webregister/estimate-fmatrix.js');

var THRESHOLD = 3;

function testPair(i1, i2){

    var matches = sample.getRawMatches(i1, i2),
        data = sample.getTwoView(i1, i2),
        features1 = sample.getFeatures(i1),
        features2 = sample.getFeatures(i2),
        metadata = {
            features1: features1,
            features2: features2,
            cam1: data.cam1,
            cam2: data.cam2
        };

    var resultF = estFmatrix(matches, metadata);
    var resultH = estHomography(resultF.dataset, metadata);

    var filtered = resultH.dataset,
        H = resultH.H;

    var persice = filtered.filter(function(match){
        var f1 = features1[match[0]],
            f2 = features2[match[1]],
            x1 = cord.feature2img(f1),
            x2 = cord.feature2img(f2),
            xx2 = H.x(x1);
        return geoUtils.distHomo2D(x2, xx2) < THRESHOLD;
    });

    console.log(persice.length + '/' + filtered.length + ' is percise');

    return Promise.all([
        testUtils.promiseVisualMatch('/home/sheep/Code/est-homo-accepted.png', i1, i2, filtered),
        testUtils.promiseVisualMatch('/home/sheep/Code/est-homo-rejected.png', i1, i2, _.difference(resultF.dataset, filtered)),
        testUtils.promiseVisualMatch('/home/sheep/Code/est-homo-percise.png', i1, i2, persice)
    ]);

}

testPair(4,5);