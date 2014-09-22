'use strict';

var Promise = require('promise'),
    grayscale = require('luminance'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Canvas = require('canvas'),
    fs = require('fs'),
    _ = require('underscore');

var samples = require('../src/utils/samples.js'),
    bruteforce = require('../src/webregister/bruteforce-matching.js'),
    eightpoint = require('../src/webregister/eightpoint.js'),
    ransac = require('../src/webregister/ransac.js'),
    homography = require('../src/webregister/estimate-homography.js'),
    utils = require('../src/utils/canvas.js'),
    drawFeatures = require('../src/visualization/drawFeatures.js'),
    drawMatches = require('../src/visualization/drawMatches.js'),
    drawImagePair = require('../src/visualization/drawImagePair.js'),
    drawEpipolarGeometry = require('../src/visualization/drawEpipolarGeometry.js'),
    cord = require('../src/utils/cord.js');


function promiseWriteFile(path, buffer){
    return new Promise(function(resolve, reject){
        fs.writeFile(path, buffer, function(err){
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}


function promiseMatchingVisual(name, img1, img2, features1, features2, matches){
    var canv = new Canvas();
    var config = drawImagePair(img1, img2, canv, 800);
    var ctx = canv.getContext('2d');
    drawFeatures(ctx, features1, 0,0, config.ratio1);
    drawFeatures(ctx, features2, config.offsetX, config.offsetY, config.ratio2);
    drawMatches(config, ctx, matches, features1, features2);
    return promiseWriteFile('/home/sheep/Code/'+name+'.png', canv.toBuffer());
}

function promiseEpipolarVisual(path, img1, img2, features1, features2, matches, F){
    var canv = new Canvas(),
        config = drawImagePair(img1, img2, canv, 800),
        ctx = canv.getContext('2d');
    drawEpipolarGeometry(config, ctx, _.sample(matches, 30), features1, features2, F);
    console.log('epipolar lines rendered');
    return promiseWriteFile(path, canv.toBuffer());
}


function promisePair(i1, i2){
    return Promise.all([
        samples.promiseCanvasImage(i1),
        samples.promiseCanvasImage(i2)
    ]).then(function(results){
        var features1 = samples.getFeatures(i1),
            features2 = samples.getFeatures(i2),
            matches = require('/home/sheep/Code/test.json');
        var canv = new Canvas();
        var config = drawImagePair(results[0], results[1], canv, 800);
        var ctx = canv.getContext('2d');
        drawFeatures(ctx, features1, 0,0, config.ratio1);
        drawFeatures(ctx, features2, config.offsetX, config.offsetY, config.ratio2);
        drawMatches(config, ctx, matches, features1, features2);
        return promiseWriteFile('/home/sheep/Code/test.png', canv.toBuffer());
    }).then(function(){
        console.log('finished');
    });
}

function promiseEpipolarGeometry(i1, i2){
    return Promise.all([
        samples.promiseCanvasImage(i1),
        samples.promiseCanvasImage(i2)
    ]).then(function(results){

        var features1 = samples.getFeatures(i1),
            features2 = samples.getFeatures(i2),
            matches = samples.getRawMatches(i1, i2),
            metadata = {
                cam1: results[0],
                cam2: results[1],
                features1: features1,
                features2: features2
            };

        var result = ransac({
            dataset: matches,
            metadata: metadata,
            subset: 8,
            relGenerator: eightpoint,
            errorGenerator: eightpoint.fundamentalMatrixError,
            outlierThreshold: 0.2,
            errorThreshold: 0.03,
            trials: 1000
        });

        console.log(result.dataset.length+'/'+matches.length+' passed RANSAC');

        return Promise.all([
            promiseMatchingVisual('raw', results[0], results[1], features1, features2, matches),
            promiseMatchingVisual('filtered', results[0], results[1], features1, features2, result.dataset),
            promiseEpipolarVisual('/home/sheep/Code/epipolar.png', results[0], results[1], features1, features2, result.dataset, result.rel)
        ]);

    }).then(function(){
        console.log('finished');
    });
}

function testErrorRange(i1, i2){
    return Promise.all([
        samples.promiseCanvasImage(i1),
        samples.promiseCanvasImage(i2)
    ]).then(function(results){

        var features1 = samples.getFeatures(i1),
            features2 = samples.getFeatures(i2),
            matches = samples.getRawMatches(i1, i2),
            metadata = {
                cam1: results[0],
                cam2: results[1],
                features1: features1,
                features2: features2
            };

        return Promise.all([0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08,0.09, 0.1].map(function(threshold){
            try {
                var result = ransac({
                    dataset: matches,
                    metadata: metadata,
                    subset: 8,
                    relGenerator: eightpoint,
                    errorGenerator: eightpoint.fundamentalMatrixError,
                    outlierThreshold: 0.2,
                    errorThreshold: threshold,
                    trials: 500
                });

                console.log(result.dataset.length+'/'+matches.length+' passed RANSAC');

                return promiseEpipolarVisual('/home/sheep/Code/epipole/'+threshold+'.png',
                    results[0], results[1], features1, features2, result.dataset, result.rel);

            }
            catch (err) {
                console.log('Did not pass when threshold = ' + threshold);
                return Promise.resolve();
            }
            /*
            return Promise.all([
                promiseMatchingVisual('raw', results[0], results[1], features1, features2, matches),
                promiseMatchingVisual('filtered', results[0], results[1], features1, features2, result.dataset),
             promiseEpipolarVisual('/home/sheep/Code/epipolar.png', results[0], results[1], features1, features2, result.dataset, result.rel)
            ]);
            */

        }));

    }).then(function(){
        console.log('finished');
    });
}

testErrorRange(2,3);

//promiseEpipolarGeometry(3,4);

