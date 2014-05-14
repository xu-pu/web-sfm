'use strict';

window.SFM = window.SFM || {};

/**
 * @typedef {{img: SFM.Grayscale, sigma: number, octave: number}} DoG
 * @typedef {{imgs: SFM.Grayscale[], octave: number, width: number, height: number}} ScaleSpace
 */


/**
 * the main function of this file, calculate SIFT of the image
 *
 * @param {SFM.Grayscale} img
 * @param {object} [options]
 * @param {int} [options.octaves]
 * @param {int} [options.scales]
 * @param {int} [options.kernelSize]
 * @returns {object[]}
 */
SFM.sift = function(img, options) {

    _.defaults(options, {
        octaves: 4,
        scales: 5,
        kernelSize: 9,
        contractThreshold: 0,
        orientationWindow: 17
    });

    var features = [];
    iterOctaves(img, function(scaleSpace){
        var DOGs = getDOGs(scaleSpace);
        features.concat(siftDetector(DOGs));
    });
    return features;



    /**
     * Construct the scale space of the image
     * @param {SFM.Grayscale} img
     * @param {int} octave
     * @returns {ScaleSpace}
     */
    function getScaleSpace(img, octave) {
        var scaleSpace = [];
        var sigma = 1;
        scaleSpace[0] = img;
        _.each(_.range(1,options.scales), function(scale){
            scaleSpace[scale] = new SFM.Grayscale({ image: img });
            scaleSpace[scale].convolution(SFM.getGuassianKernel(options.kernelSize, sigma).getNativeRows());
            sigma *= 2;
        });
        return {
            imgs: scaleSpace,
            octave: octave,
            width: img.width,
            height: img.height
        };
    }


    /**
     * Construct octave space of the grayscale image
     * @param img
     * @param {function} callback
     */
    function iterOctaves(img, callback) {
        var width = img.width,
            height = img.height;
        var row, col, lastBase, base=img;
        _.range(options.octaves).forEach(function(octave){
            if (octave > 0) {
                // create shrinked version of the previous octave
                width = Math.floor(width/2);
                height = Math.floor(height/2);
                base = new SFM.Grayscale({ width: width, height: height });
                for (row=0; row<height; row++) {
                    for (col=0; col<width; col++) {
                        base.setPixel(row, col, (lastBase[row*2][col*2]+lastBase[row*2+1][col*2]+lastBase[row*2][col*2+1]+lastBase[row*2+1][col*2+1])/4);
                    }
                }
            }
            callback(getScaleSpace(base, octave));
            lastBase = base;
        });
    }

    /**
     * Find keypoints from the DOGs of one scale space
     * @param {DoG[]} dogs
     * @return {Feature[]}
     */
    function siftDetector(dogs) {
        var width = dogs[0].img.width,
            height = dogs[0].img.height,
            octave = dogs[0].octave;

        var features = [];

        var layer;
        for(layer=1; layer<dogs.length-1; layer++) {

            _.range(height).forEach(function(row){
                _.range(width).forEach(function(col){

                    var center = dogs[layer].img.getRC(row,col);
                    var max = null;
                    var min = null;

                    var isLimit = _.range(-1, 2).every(function(x){
                        return _.range(-1, 2).every(function(y){
                            return _.range(-1, 2).every(function(z){
                                if(!(x===0 && y===0 && z===0)) {
                                    var cursor = dogs[layer+z].img.getRC(row+y, col+x);
                                    if (cursor > center && (max === null || cursor > max)) {
                                        max = cursor;
                                    }
                                    else if (cursor < center && (max === null || cursor < min)) {
                                        min = cursor;
                                    }
                                    else if (cursor === center && (max === null || min === null)) {
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

                    //var limit = max || min;

                    if (isLimit) {
                        if (center >= options.contractThreshold) {
                            siftOrientation(dogs[layer], row, col).forEach(function(direction){
                                features.push(siftDescriptor(row, col, direction, dogs[layer]));
                            });
                        }
                    }

                });
            });

        }
        return features;
    }


    /**
     *
     * @param {ScaleSpace} scaleSpace
     * @returns {DoG[]}
     */
    function getDOGs(scaleSpace) {
        return _.map(scaleSpace.slice(1), function(layer, index){
            return {
                img: layer.difference(scaleSpace[index]),
                octave: scaleSpace.octave,
                sigma: Math.pow(2, index)
            };
        });
    }


    /**
     *
     * @param {number} row
     * @param {number} col
     * @param {number} direction
     * @param {DoG} img
     * @return {Feature}
     */
    function siftDescriptor(row, col, direction, img) {
        var centerOrientation;
        var neighboroOrientation = [];

    }

    /**
     *
     * @param {DoG} dog
     * @param {number} row
     * @param {number} col
     * @return {number[]}
     */
    function siftOrientation(dog, row, col) {
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
        _.each(orientations, function(value, index){
            if (value/maximum >= 0.8) {
                directions.push(Math.PI/36*index+Math.PI/72);
            }
        });
        return directions;
    }

};
