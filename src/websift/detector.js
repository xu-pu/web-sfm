'use strict';

var _ = require('underscore');

var siftOrientation = require('./orientation.js');

module.exports = siftDetector;

/**
 * Find keypoints from the DOGs of one scale space
 * @param dogs
 * @param {Number} octave
 * @param {Function} callback
 */
function siftDetector(dogs, octave, callback){

    console.log('detecting feature points');

    var width = Math.ceil(dogs[0].img.shape[1]/2),
        height = Math.ceil(dogs[0].img.shape[0]/2),
        contrastWindow = [-1,0,1];

    _.range(1, dogs.length-1).forEach(function(layer){

        _.range(height).forEach(function(row){
            _.range(width).forEach(function(col){

                var center = dogs[layer].img.get(row,col);
                var max = null;
                var min = null;

                var isLimit = contrastWindow.every(function(x){
                    return contrastWindow.every(function(y){
                        return contrastWindow.every(function(z){
                            if(x===0 && y===0 && z===0) {
                                return true;
                            }
                            else {
                                var cursor = dogs[layer+z].img.get(row+y, col+x);
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
                    console.log('detected one');
                    console.log(siftOrientation(dogs[layer], row, col));
                    //callback(dogs[layer], octave, row, col);
                }

            });
        });
    });
}
