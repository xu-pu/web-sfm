var imgshow = require('ndarray-imshow');
var lena = require('lena');
var grayscale = require('luminance');
var getPixels = require('get-pixels');
var toRGB = require('../src/websift/gray2rgb.js');
var testImg = grayscale(lena);

var getDoG = require('../src/websift/dogspace.js');
var siftDetector = require('../src/websift/detector.js');

var basePath = '/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/images/00000001.jpg';

getPixels(basePath, function(err, img){
    console.log('image loaded');
    var g = grayscale(img);
//    imgshow(img);
    getDoG(g, 4).forEach(function(dog){
        imgshow(toRGB(dog.img));
    });
});
