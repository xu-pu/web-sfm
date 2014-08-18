var Promise = require('promise'),
    grayscale = require('luminance'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Canvas = require('canvas'),
    fs = require('fs');

var samples = require('../src/utils/samples.js');
var bruteforce = require('../src/webregister/bruteforce-matching.js');

var utils = require('../src/utils/canvas.js');
var visual = require('../src/utils/visualization.js');


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

function promisePair(i1, i2){
    return Promise.all([
        samples.promiseCanvasImage(i1),
        samples.promiseCanvasImage(i2)
    ]).then(function(results){
        var features1 = samples.getFeatures(i1),
            features2 = samples.getFeatures(i2),
            matches = require('/home/sheep/Code/test.json');
        var canv = new Canvas();
        var config = visual.drawImagePair(results[0], results[1], canv, 800);
        var ctx = canv.getContext('2d');
        visual.drawFeatures(ctx, features1, 0,0, config.ratio1);
        visual.drawFeatures(ctx, features2, config.offsetX, config.offsetY, config.ratio2);
        visual.drawMatches(config, ctx, matches, features1, features2);
        return promiseWriteFile('/home/sheep/Code/test.png', canv.toBuffer());
    }).then(function(){
        console.log('finished');
    });
}

promisePair(1,2);

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
