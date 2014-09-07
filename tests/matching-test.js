var Promise = require('promise'),
    grayscale = require('luminance'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Canvas = require('canvas'),
    fs = require('fs'),
    _ = require('underscore');

var samples = require('../src/utils/samples.js');
var bruteforce = require('../src/webregister/bruteforce-matching.js');
var eightpoint = require('../src/webregister/eightpoint.js');
var ransac = require('../src/webregister/ransac.js');

var utils = require('../src/utils/canvas.js'),
    drawFeatures = require('../src/utils/visualization/drawFeatures.js'),
    drawMatches = require('../src/utils/visualization/drawMatches.js'),
    drawImagePair = require('../src/utils/visualization/drawImagePair.js');


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
            matches = require('/home/sheep/Code/test.json');

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
            outlierThreshold: 0.1,
            errorThreshold: 0.005,
            trials: 1000
        });

        console.log(result.dataset.length+'/'+matches.length+' passed RANSAC');


//    return Promise.all([
//        promiseMatchingVisual('raw', results[0], results[1], features1, features2, matches),
//        promiseMatchingVisual('filtered', results[0], results[1], features1, features2, result.dataset)
//    ]);
    }).then(function(){
        console.log('finished');
    });
}


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
