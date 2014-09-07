'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric');

var getGradient = require('../math/gradient.js'),
    getGuassianKernel = require('../math/kernels.js').getGuassianKernel;


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
        radius = windowSize/ 2,
        guassianWeight = getGuassianKernel(windowSize, sigma*1.5),
        orientations = new Float32Array(36);

    var x, y, gradient, bin;
    for (x=-radius; x<radius+1; x++) {
        for(y=-radius; y<radius+1; y++){
            gradient = getGradient(img, row+y, col+x);
            bin = Math.floor(gradient.dir/(2*Math.PI/36));
            orientations[bin] += gradient.mag*guassianWeight.elements[radius+y][radius+x];
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