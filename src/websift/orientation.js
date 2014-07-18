var _ = require('underscore');

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
    var img = dog.img;
    var sigma = dog.sigma;
    var windowSize = 17;
    var radius = windowSize/2;
    var guassianWeight = SFM.getGuassianKernel(windowSize, sigma*1.5);
    var x, y, gradient,  orientations = new Float32Array(36);
    for (x=-radius; x<radius+1; x++) {
        for(y=-radius; y<radius+1; y++){
            gradient = img.getGradient(col+x, img.height-1-row+y);
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