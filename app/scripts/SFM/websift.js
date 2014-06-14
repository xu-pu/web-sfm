'use strict';


if (typeof SFM === 'undefined') {
    var SFM = {};
}

/**
 * @typedef {{img: SFM.Grayscale, sigma: number, octave: number}} DoG
*/

/**
 * @typedef {{imgs: SFM.Grayscale[], octave: number, width: number, height: number}} ScaleSpace
 */

/**
 * @typedef {{img: SFM.Grayscale, sigma: number}} Scale
 */

/**
 * @typedef {{ dogs: SFM.Grayscale[], sigma: number, octave: number, height: number, width: number }} Octave
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

    options = options || {};

    _.defaults(options, {
        octaves: 4,
        scales: 5,
        kernelSize: 3,
        contractThreshold: 0,
        orientationWindow: 17
    });

    var features = [];
    SFM.iterOctaves(img, function(img, octave){
        var ss = SFM.getScaleSpace(img, octave);
        var dogs = SFM.getDOGs(ss);
        SFM.siftDetector(dogs, options, function(img, row, col){
            SFM.siftOrientation(img, row, col, options).forEach(function(dir){
                var f = SFM.siftDescriptor(img, row, col, dir);
                features.push(f);
            });
        });
    });
    return features;

};


/**
 * Construct octave space of the grayscale image
 * @param img
 * @param {function} callback
 */
SFM.iterOctaves = function(img, callback){
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
                    base.setRC(row, col, (lastBase.get(row*2, col*2)+lastBase.get(row*2+1,col*2)+lastBase.get(row*2, col*2+1)+lastBase.get(row*2+1, col*2+1))/4);
                }
            }
        }
        callback(getScaleSpace(base, octave));
        lastBase = base;
    });
};


/**
 * Construct the scale space of the image
 * @param {SFM.Grayscale} img
 * @param {int} octave
 * @returns {ScaleSpace}
 */
SFM.getScaleSpace = function(img, octave) {
    console.log('calculating scalespace');
    var scaleSpace = [];
    var sigma = 1;
    scaleSpace[0] = img;
    _.range(1,options.scales).forEach(function(scale){
        scaleSpace[scale] = new SFM.Grayscale({ image: img });
        scaleSpace[scale].convolution(SFM.getGuassianKernel(options.kernelSize, sigma).getNativeRows());
        sigma *= Math.sqrt(2);
    });
    return {
        imgs: scaleSpace,
        octave: octave,
        width: img.width,
        height: img.height
    };
};


/**
 *
 * @param {ScaleSpace} scaleSpace
 * @returns {DoG[]}
 */
SFM.getDOGs = function(scaleSpace) {
    console.log('calculating dogs');
    var result = [];
    _.range(1, scaleSpace.imgs.length).forEach(function(index){
        result.push({
            img: scaleSpace.imgs[index-1].difference(scaleSpace.imgs[index]),
            octave: scaleSpace.octave,
            sigma: Math.pow(2, index)
        });
    });
    return result;
};


/**
 * Find keypoints from the DOGs of one scale space
 * @param {DoG[]} dogs
 * @param {Object} options
 * @param {Function} callback
 */
SFM.siftDetector = function(dogs, options, callback){
    console.log('detecting feature points');

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
//                    siftOrientation(dogs[layer], row, col).forEach(function(direction){
//                        features.push(siftDescriptor(row, col, direction, dogs[layer]));
//                    });
                }
            });
        });

    }
    return features;
};

/**
 * @param {DoG} img
 * @param {number} row
 * @param {number} col
 * @param {number} direction
 * @return {Feature}
 */
SFM.siftDescriptor = function(img, row, col, direction){
    console.log('describing feature points');
    var point = SFM.RCtoImg(row, col, this.width, this.height);
    var transform = SFM.M([
        [Math.cos(direction), -Math.sin(direction), point.get(0,0)],
        [Math.sin(direction), Math.cos(direction), point.get(1,0)],
        [0,0,1]]);
    var descriptor = new Float32Array(128); // 4*4*8
    _.range(-8, 8).forEach(function(x){
        _.range(-8, 8).forEach(function(y){
            var block = Math.floor((x+8)/4)+4*Math.floor((y+8)/4);
            var imgPoint = transform.dot(SFM.M([[x,y,1]]).transpose());
            var gra = img.img.getGradient(imgPoint.get(0,0), imgPoint.get(1,0));
            var bin = Math.floor((gra.dir+Math.PI)/(2*Math.PI/8));
            descriptor[block*8+bin] = gra.mag;
        })
    });
    console.log(descriptor);
    return {
        row: row,
        col: col,
        vector: descriptor
    };
};


/**
 *
 * @param {DoG} dog
 * @param {number} row
 * @param {number} col
 * @param {Object} options
 * @return {number[]}
 */
SFM.siftOrientation = function(dog, row, col, options){
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
    _.each(orientations, function(value, index){
        if (value/maximum >= 0.8) {
            directions.push(Math.PI/36*index+Math.PI/72);
        }
    });
    return directions;
};

/**
 * @param {Scale} s1
 * @param {Scale} s2
 * @return {DOG}
 */
SFM.getDOG = function(s1, s2){

};

/**
 *
 * @param {SFM.Grayscale} img
 * @param {number} sigma
 * @param {Object} options
 * @return {Scale}
 */
SFM.getScale = function(img, sigma, options){
    var result = new SFM.Grayscale({ image: img });
    result.convolution(SFM.getGuassianKernel(options.kernelSize, sigma).getNativeRows());
    return { img: result, sigma: sigma };
};