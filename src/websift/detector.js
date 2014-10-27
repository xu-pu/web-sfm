'use strict';

var _ = require('underscore');

module.exports = detect;

/**
 * @param {DoG[]} dogs
 * @param {Number} contrast
 * @param {Function} callback
 */
function detect(dogs, contrast, callback){

    console.log('detecting feature points');

    var imgs = dogs.map(function(dog){ return dog.img; }),
        layer = imgs[1],
        width = layer.shape[0],
        height = layer.shape[1],
        contrastWindow = [-1,0,1];

    _.range(height).forEach(function(row){
        _.range(width).forEach(function(col){

            var center = layer.get(col, row),
                max = -Infinity,
                min = Infinity;

            if (center < contrast) {
                return;
            }

            var isLimit = contrastWindow.every(function(x){
                return contrastWindow.every(function(y){
                    return contrastWindow.every(function(z){
                        if(x===0 && y===0 && z===0) {
                            return true;
                        }
                        else {
                            var cursor = imgs[1+z].get(col+x, row+y);
                            if (cursor > max) {
                                max = cursor;
                            }
                            if (cursor < min) {
                                min = cursor;
                            }
                            return !(center >= min && center <= max);
                        }
                    });
                });
            });

            if (isLimit) {
                callback(dogs, row, col);
            }

        });
    });

}