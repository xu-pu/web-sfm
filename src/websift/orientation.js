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
 * @return {number}
 */
function getPointOrientation(dog, row, col, options){
    //console.log('orienting feature points');
    var img = dog.img,
        sigma = dog.sigma,
        radius = 8,
        windowSize = 2*radius+1,
        guassianWeight = getGuassianKernel(windowSize, sigma*1.5),
        orientations = new Float32Array(36);

    var x, y, gradient, bin;
    for (x=-radius; x<=radius; x++) {
        for(y=-radius; y<=radius; y++){
            gradient = getGradient(img, row+y, col+x);
            //console.log(gradient);
            bin = Math.floor(gradient.dir/(2*Math.PI/36)) % 36;
            if(bin < 0) {
                bin = bin+36;
            }
            orientations[bin] += gradient.mag*guassianWeight.elements[radius+y][radius+x];
        }
    }
    /*
     var maximum = _.max(orientations),
        directions = [],
        iterBin;
    for (iterBin=0; iterBin<36; iterBin++) {
        if (orientations[iterBin]/maximum >= 0.8) {
            directions.push(Math.PI/36*iterBin+Math.PI/72);
        }
    }
    return directions;
    */
    var maximum=-Infinity, maxIndex, iterOrien;
    for (iterOrien=0; iterOrien<36; iterOrien++) {
        if (orientations[iterOrien]>maximum) {
            maximum = orientations[iterOrien];
            maxIndex = iterOrien;
        }
    }
    return Math.PI/36*maxIndex+Math.PI/72;
}