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

function promiseEpipolarVisual(img1, img2, features1, features2, matches, F){
    var canv1 = new Canvas(),
        canv2 = new Canvas(),
        ctx1 = canv1.getContext('2d'),
        ctx2 = canv2.getContext('2d');
    ctx1.strokeStyle = 'red';
    ctx1.lineWidth = 10;
    ctx2.strokeStyle = 'red';
    ctx2.lineWidth = 10;
    canv1.width = img1.width;
    canv1.height = img1.height;
    canv2.width = img2.width;
    canv2.height = img2.height;
    ctx1.drawImage(img1, 0, 0);
    ctx2.drawImage(img2, 0, 0);
    var epipolarLines = _.sample(matches, 30).map(function(match){
        var f1 = features1[match[0]],
            f2 = features2[match[1]],
            p1 = Vector.create(cord.featureToImg(f1, img1)),
            p2 = Vector.create(cord.featureToImg(f2, img2)),
            line1 = F.x(p2),
            line2 = F.transpose().x(p1);
        return [
            cord.imgline2points(line1, img1.width, img1.height),
            cord.imgline2points(line2, img2.width, img2.height)
        ];
    });
    epipolarLines.forEach(function(pair){
        var line1 = pair[0],
            line2 = pair[1];
        if (line1.length === 2) {
            ctx1.moveTo(line1[0].col, line1[0].row);
            ctx1.lineTo(line1[1].col, line1[1].row);
        }
        if (line2.length === 2) {
            ctx2.moveTo(line2[0].col, line2[0].row);
            ctx2.lineTo(line2[1].col, line2[1].row);
        }
    });
    ctx1.stroke();
    ctx2.stroke();
    console.log('epipolar lines rendered');
    return Promise.all([
        promiseWriteFile('/home/sheep/Code/epi1.png', canv1.toBuffer()),
        promiseWriteFile('/home/sheep/Code/epi2.png', canv2.toBuffer())
    ]);
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
            matches = require('/home/sheep/Code/matches/raw-match/00000002.jpg&00000003.jpg.json');

        var metadata = {
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
            outlierThreshold: 0.15,
            errorThreshold: 0.05,
            trials: 1000
        });

        console.log(result.dataset.length+'/'+matches.length+' passed RANSAC');

/*
        var filtered = ransac({
            dataset: result.dataset,
            metadata: metadata,
            subset: 4,
            relGenerator: homography,
            errorGenerator: homography.homographyError,
            outlierThreshold: 0.15,
            errorThreshold: 500,
            trials: 1000
        });

        console.log(result.dataset.length+'/'+result.dataset.length+' passed homography RANSCA');
*/
        return Promise.all([
            promiseMatchingVisual('raw', results[0], results[1], features1, features2, matches),
            promiseMatchingVisual('filtered', results[0], results[1], features1, features2, result.dataset),
            promiseEpipolarVisual(results[0], results[1], features1, features2, result.dataset, result.rel)
        ]);
    }).then(function(){
        console.log('finished');
    });
}

promiseEpipolarGeometry(2,3);

//promisePair(1,2);

//promisePair(3,4);

//samples.promiseImage(1).then(function(img){
//    samples.showGrayscale(img);
//});

//var matches = bruteforce(samples.getFeatures(1), samples.getFeatures(2), 0.8);
//console.log(matches.length);

//promiseWriteFile('/home/sheep/Code/test.json', JSON.stringify(matches)).then(function(){
//    var obj = require('/home/sheep/Code/test.json');
//    console.log(obj.length);
//});
