var DEMO_BASE = '/home/sheep/Code/Project/web-sfm/demo/Hall-Demo';

var Promise = require('promise');
var getPixels = require('get-pixels');
var grayscale = require('luminance');
var imgshow = require('ndarray-imshow');
var Image = require('canvas').Image;
var fs = require('fs');

var toRGB = require('../websift/gray2rgb.js');
var bundler = require(DEMO_BASE + '/bundler/bundler.json');

module.exports.promiseImage = promiseImage;
module.exports.getCamera = getCamera;
module.exports.showGrayscale = showGrayscale;
module.exports.getFeatures = getFeatures;
module.exports.promiseCanvasImage = promiseCanvasImage;

function getFeatures(index){
    var siftPath = DEMO_BASE + '/sift.json/' + getFullname(index) + '.json';
    return require(siftPath).features;
}

function getImagePath(index){
    return DEMO_BASE + '/images/' + getFullname(index) + '.jpg';
}

function getFullname(index){
    var name = String(index),
        prefixLength = 8-name.length;
    for (var i= 0; i<prefixLength; i++) {
        name = '0' + name;
    }
    return name;
}


function getCamera(index){
    return bundler.cameras[index];
}

function promiseImage(index){
    return new Promise(function(resolve, reject){
        getPixels(getImagePath(index), function(err, img){
            console.log('image loaded');
            resolve(grayscale(img));
        });
    });
}

function promiseCanvasImage(index){
    return new Promise(function(resolve, reject){
        fs.readFile(getImagePath(index), function(err, buffer){
            if (err) {
                console.log('load failed');
                reject(err);
            }
            var img = new Image;
            img.src = buffer;
            resolve(img);
        });
    });
}

function showGrayscale(gray){
    imgshow(toRGB(gray));
}

function storeFeatureMatches(){}

function getFeatureMatches(){}