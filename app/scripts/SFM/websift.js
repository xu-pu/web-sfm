/**
 * @typedef {{img: SFM.Grayscale, sigma: number, octave: number}} DoG
*/

/**
 * @typedef {{ dogs: DoG[], octave: number, height: number, width: number }} DogSpace
 */

/**
 * @typedef {{ img: SFM.Grayscale, sigma: number, octave: number }} Scale
 */


/**
 * @typedef {{scales: Scale[], octave: number, width: number, height: number}} ScaleSpace
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
    SFM.iterOctaves(img, options, function(base, octaveIndex){
        var scales = SFM.getScales(base, octaveIndex, options);
        var octave = SFM.getDOGs(scales, options);
        SFM.siftDetector(octave, options, function(img, row, col){
            features.push({ row: row, col: col });
/*            SFM.siftOrientation(img, row, col, options).forEach(function(dir){
                var f = SFM.siftDescriptor(img, row, col, dir);
                features.push(f);
            });
            */
        });
    });
    return features;
};


/**
 * Construct octave space of the grayscale image
 * @param img
 * @param options
 * @param {function} callback
 */
SFM.iterOctaves = function(img, options, callback){
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
        callback(base);
        lastBase = base;
    });
};


/**
 * Construct the scale space of the image
 * @param {SFM.Grayscale} img
 * @param {number} octave
 * @param options
 * @returns {ScaleSpace}
 */
SFM.getScales = function(img, octave, options) {
    console.log('calculating scalespace');
    var sigma = Math.sqrt(2);
    var scaleSpace = _.range(0, options.scales).map(function(scale){
        sigma *= Math.sqrt(2);
        var i = img;
        if (scale !== 0) {
            i = new SFM.Grayscale({ image: img });
            i.convolution(SFM.getGuassianKernel(options.kernelSize, sigma).getNativeRows());
        }
        return {
            img: i,
            sigma: sigma,
            octave: octave
        };
    });
    //console.log(scaleSpace);
    return {
        scales: scaleSpace,
        octave: octave,
        width: img.width,
        height: img.height
    };
};

/**
 *
 * @param {ScaleSpace} scaleSpace
 * @param options
 * @returns {DogSpace}
 */
SFM.getDOGs = function(scaleSpace, options) {
    console.log('calculating dogs');
    var dogs = _.range(1, scaleSpace.scales.length).map(function(index){
        var img = scaleSpace.scales[index-1].img.difference(scaleSpace.scales[index].img);
        return {
            img: img,
            octave: scaleSpace.octave,
            sigma: 1
        };
    });
    return {
        dogs: dogs,
        octave: scaleSpace.octave,
        width: scaleSpace.width,
        height: scaleSpace.height
    };
};

/**
 * Find keypoints from the DOGs of one scale space
 * @param {DogSpace} dogSpace
 * @param {Object} options
 * @param {Function} callback
 */
SFM.siftDetector = function(dogSpace, options, callback){
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
    orientations.forEach(function(value, index){
        if (value/maximum >= 0.8) {
            directions.push(Math.PI/36*index+Math.PI/72);
        }
    });
    return directions;
};

