'use strict';

var _ = require('underscore');

module.exports = detect;

/**
 * @param {DoG[]} dogs
 * @param {Function} callback
 */
function detect(dogs, callback){

    console.log('detecting feature points');

    var imgs = dogs.map(function(dog){ return dog.img; }),
        layer = dogs[1],
        width = layer.shape[1],
        height = layer.shape[0],
        contrastWindow = [-1,0,1];

    _.range(height).forEach(function(row){
        _.range(width).forEach(function(col){

            var center = layer.get(row,col);
            var max = null;
            var min = null;

            var isLimit = contrastWindow.every(function(x){
                return contrastWindow.every(function(y){
                    return contrastWindow.every(function(z){
                        if(x===0 && y===0 && z===0) {
                            return true;
                        }
                        else {
                            var cursor = imgs[1+z].get(row+y, col+x);
                            if (cursor > center && (max === null || cursor > max)) {
                                max = cursor;
                            }
                            else if (cursor < center && (min === null || cursor < min)) {
                                min = cursor;
                            }
                            else if (cursor === center) {
                                return false;
                            }
                            return (max === null || min === null);
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