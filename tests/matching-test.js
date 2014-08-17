var Promise = require('promise'),
    grayscale = require('luminance'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var samples = require('../src/utils/samples.js');
var bruteforce = require('../src/webregister/bruteforce-matching.js');

var matches = bruteforce(samples.getFeatures(1), samples.getFeatures(2), 0.8);
console.log(matches.length);