module.exports = siftDetector;

/**
 * Find keypoints from the DOGs of one scale space
 * @param {DogSpace} dogSpace
 * @param {Object} options
 * @param {Function} callback
 */
function siftDetector(dogSpace, options, callback){
    console.log('detecting feature points');

    var width = dogSpace.width,
        height = dogSpace.height,
        dogs = dogSpace.dogs,
        octave = dogs.octave;

    var contrastWindow = _.range(-1,2);
    var features = [];

    _.range(1, dogs.length-1).forEach(function(layer){

        _.range(height).forEach(function(row){
            _.range(width).forEach(function(col){

                var center = dogs[layer].img.getRC(row,col);
                var max = null;
                var min = null;

                var isLimit = contrastWindow.every(function(x){
                    return contrastWindow.every(function(y){
                        return contrastWindow.every(function(z){
                            if(!(x===0 && y===0 && z===0)) {
                                var cursor = dogs[layer+z].img.getRC(row+y, col+x);
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
                            else {
                                return true;
                            }
                        });
                    });
                });

                if (isLimit) {
                    console.log('found one');
                    callback(dogs[layer], row, col);
                }
            });
        });



    });
    var layer;
    for(layer=1; layer<dogs.length-1; layer++) {


    }
    return features;
}
