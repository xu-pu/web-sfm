'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric');

var cord = require('../utils/cord.js'),
    getGradient = require('./gradient.js'),
    getGuassianKernel = require('../utils/guassian-kernel.js');


module.exports = getPointOrientation;

/**
 *
 * @param {DoG} dog
 * @param {number} row
 * @param {number} col
 * @param {Object} options
 * @return {number[]}
 */
function getPointOrientation(dog, row, col, options){
    console.log('orienting feature points');
    var img = dog.img,
        sigma = dog.sigma,
        windowSize = 17,
        radius = windowSize/2;
    var guassianWeight = getGuassianKernel(windowSize, sigma*1.5);
    var x, y, gradient,  orientations = new Float32Array(36);
    for (x=-radius; x<radius+1; x++) {
        for(y=-radius; y<radius+1; y++){
            gradient = getGradient(img, col+x, img.height-1-row+y);
            orientations[Math.floor(gradient/(2*Math.PI))] += gradient.mag*guassianWeight.get(radius+y, radius+x);
        }
    }
    var maximum = _.max(orientations);
    var directions = [];
    orientations.forEach(function(value, index){
        if (value/maximum >= 0.8) {
            directions.push(Math.PI/36*index+Math.PI/72);
        }
    });
    return directions;
}