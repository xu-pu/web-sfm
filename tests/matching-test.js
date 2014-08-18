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

Promise.all([
    samples.promiseCanvasImage(1),
    samples.promiseCanvasImage(2)
]).then(function(results){
    var canv = new Canvas();
    var config = visual.drawImagePair(results[0], results[1], canv, 800);
    var ctx = canv.getContext('2d');
    visual.drawFeatures(ctx, samples.getFeatures(1), 0,0, config.ratio1);
    visual.drawFeatures(ctx, samples.getFeatures(2), config.offsetX, config.offsetY, config.ratio2);
    fs.writeFile('/home/sheep/Code/test.png', canv.toBuffer(), function(err){
        console.log('write');
    });
});

//samples.promiseImage(1).then(function(img){
//    samples.showGrayscale(img);
//});

//var matches = bruteforce(samples.getFeatures(1), samples.getFeatures(2), 0.8);
//console.log(matches.length);