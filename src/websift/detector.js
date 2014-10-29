'use strict';

var _ = require('underscore');

module.exports = detect;

/**
 * @param {DogSpace} dogspace
 * @param {Number} layer
 * @param {Number} contrast
 * @param {Function} callback
 */
function detect(dogspace, layer, contrast, callback){

    console.log('detecting feature points');

    var img = dogspace.dogs[layer].img,
        width = img.shape[0],
        height = img.shape[1],
        contrastWindow = [-1,0,1];

    _.range(height).forEach(function(row){
        _.range(width).forEach(function(col){

            var center = img.get(col, row),
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
                            var cursor = dogspace.get(row+y, col+x, layer+z);
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
                callback(row, col);
            }

        });
    });

}