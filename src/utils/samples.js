var DEMO_BASE = '/home/sheep/Code/Project/web-sfm/demo/Hall-Demo';

var Promise = require('promise');
var getPixels = require('get-pixels');
var grayscale = require('luminance');
var imgshow = require('ndarray-imshow');
var toRGB = require('../websift/gray2rgb.js');
var bundler = require(DEMO_BASE + '/bundler/bundler.json');

module.exports.promiseImage = promiseImage;
module.exports.getCamera = getCamera;
module.exports.showGrayscale = showGrayscale;

function getImagePath(index){
    var name = String(index),
        prefixLength = 8-name.length;
    for (var i= 0; i<prefixLength; i++) {
        name = '0' + name;
    }
    return DEMO_BASE + '/images/' + name + '.jpg';
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

function showGrayscale(gray){
    imgshow(toRGB(gray));
}

function storeFeatureMatches(){}

function getFeatureMatches(){}