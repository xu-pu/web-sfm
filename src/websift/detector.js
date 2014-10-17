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
        layer = imgs[1],
        width = layer.shape[1],
        height = layer.shape[0],
        contrastWindow = [-1,0,1];

    _.range(height).forEach(function(row){
        _.range(width).forEach(function(col){

            var center = layer.get(row,col),
                max = -Infinity,
                min = Infinity;

            var isLimit = contrastWindow.every(function(x){
                return contrastWindow.every(function(y){
                    return contrastWindow.every(function(z){
                        if(x===0 && y===0 && z===0) {
                            return true;
                        }
                        else {
                            var cursor = imgs[1+z].get(row+y, col+x);
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
                var contrast = center > max ? center-max : min-center;
                callback(dogs, row, col, contrast);
            }

        });
    });

}