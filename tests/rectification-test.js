var imgshow = require('ndarray-imshow');
var lena = require('lena');
var grayscale = require('luminance');
var getPixels = require('get-pixels');
var toRGB = require('../src/websift/gray2rgb.js');
var testImg = grayscale(lena);

var getDoG = require('../src/websift/dogspace.js');
var siftDetector = require('../src/websift/detector.js');
