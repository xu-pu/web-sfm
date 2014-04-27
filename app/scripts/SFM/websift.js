'use strict';

window.SFM = window.SFM || {};

/*
self.onmessage = function(e) {
    console.log(e.data);
    self.postMessage('done');    
};
*/

var OCTAVE = 4;
var SCALE = 5;
var CONTRACT_THRESHOLD = 0;

var RGB2GRAY_R = 0.2989;
var RGB2GRAY_G = 0.5870;
var RGB2GRAY_B = 0.1140;

var SOBEL_KERNEL_X = [
    [-1,0,1],
    [-2,0,2],
    [-1,0,1]
];
var SOBEL_KERNEL_Y = [
    [ 1, 2, 1],
    [ 0, 0, 0],
    [-1,-2,-1]
];

var GUASS_KERNEL_TEST = [
    [0.0030, 0.0133, 0.0219, 0.0133, 0.0030],
    [0.0133, 0.0596, 0.0983, 0.0596, 0.0133],
    [0.0219, 0.0983, 0.1621, 0.0983, 0.0219],
    [0.0133, 0.0596, 0.0983, 0.0596, 0.0133],
    [0.0030, 0.0133, 0.0219, 0.0133, 0.0030]
];


/**
 * Construct a Guassian kernel with specific radius
 * @param radius -- count by pixel
 * @returns {number[][]}
 */
function getGuassKernel(radius) {
    var row, col, x, y, diameter=radius*2-1;
    var kernel = [].constructor(diameter);
    for (row=0; row<diameter; row++) {
        kernel[row] = [].constructor(diameter);
        for (col=0; col<diameter; col++) {
            x = col-radius+1;
            y = row-radius+1;
//            kernel[row][col] = guass(x,y,sigma);
        }
    }
    return kernel;
}



/**
 *
 * Grayscale Image
 *
 * @param {string} source -- specify how the new image is constructed, canvas/image/blank
 * @param {object} options
 * @param {Grayscale} [options.image]
 * @param {object} [options.canvas]
 * @param {int} [options.width]
 * @param {int} [options.height]
 * @constructor
 * @this {Grayscale}
 */
function Grayscale(source, options){

    var row, col;
    if (source === 'canvas') {
        this.createImage(options.canvas.width, options.canvas.height);
        var offset, data = options.canvas.data;
        for (row=0; row<options.canvas.height; row++) {
            for (col=0; col<options.canvas.width; col++) {
                offset = 4 * (options.canvas.width * row + col);
                this.data[row][col] = Math.floor(RGB2GRAY_R * data[offset] + RGB2GRAY_G * data[offset+1] + RGB2GRAY_B * data[offset+2]);
            }
        }
    }
    else if (source === 'image'){
        this.createImage(options.image.width, options.image.height);
        for (row=0; row<this.height; row++) {
            for (col=0; col<this.width; col++) {
                this.data[row][col] = options.image.data[row][col];
            }
        }
    }
    else if (source === 'blank') {
        this.createImage(options.width, options.height);
    }
    else {
        console.log("options is invalid");
    }
}

Grayscale.prototype = {

    /**
     * access extended version of the image
     * when convoluting an image, image border needs to be extended, this function will do the border extension
     * if boder extension is not needed, just use image.data array
     *
     * @param {int} x
     * @param {int} y
     * @returns {number}
     */
    getPoint : function(x, y) {
        if (x>=0 && y>=0 && x<this.width && y<this.height) {
            return this.data[y][x];
        }
        if (x>=this.width){
            x = this.width-1;
        }
        else if (x<0){
            x = 0;
        }
        if (y>=this.height){
            y = this.height-1;
        }
        else if (y<0){
            y = 0;
        }
        return this.data[y][x];
    },


    /**
     * creat new empty image array
     *
     * @param {int} width
     * @param {int} height
     */
    createImage: function(width, height) {
        this.data = [].constructor(height);
        var row;
        for (row=0; row<height; row++) {
            this.data[row] = [].constructor(width);
        }
        this.width = width;
        this.height = height;
    },


    /**
     * Convolution at a point
     * @param {int} x
     * @param {int} y
     * @param {number[][]} kernel
     * @return {number}
     */
    getPointConvolution: function(x, y, kernel){
        var offsetY, offsetX, pixel=0, radius=(kernel.length-1)/2;
        for (offsetY=-radius; offsetY<radius+1; offsetY++) {
            for (offsetX=-radius; offsetX<radius+1; offsetX++) {
                pixel += kernel[radius+offsetY][radius+offsetX] * this.getPoint(x+offsetX, y+offsetY);
            }
        }
        return pixel;
    },


    /**
     * Concolute the image with the kernel
     * @param {number[][]} kernel
     * @return {Grayscale}
     */
    convolution: function(kernel) {
        var row, col, result = new Grayscale('image', { image: this });
        for (row=0; row<this.height; row++) {
            for (col=0; col<this.width; col++) {
                result.data[row][col] = this.getPointConvolution(col, row, kernel);
            }
        }
        return result;
    },

    /**
     *
     * @param img
     * @returns {Grayscale}
     */
    difference: function(img) {
        var result = new Grayscale('image', { image: this });
        var row, col;
        for (row=0; row<this.height; row++) {
            for (col=0; col<this.width; col++) {
                result.data[row][col] = Math.abs(this.data[row][col]-img.data[row][col]);
            }
        }
        return result;
    },


    /**
     * Calculate gradient of a point
     * @param {int} x
     * @param {int} y
     * @param {string} direction
     * @return {number}
     */
    getGradient: function(x, y, direction) {
        var kernel;
        switch (direction) {
            case 'x':
                kernel = SOBEL_KERNEL_X;
                break;
            case 'y':
                kernel = SOBEL_KERNEL_Y;
                break;
            default:
                console.log('getGradient invalid parameter');
                return 0;
        }
        return this.getPointConvolution(x, y, kernel);
    },

    getOrientation: function(x, y, radius, offset) {



    }
};


/**
 *
 * @param {int} x
 * @param {int} y
 * @param {number[]} descriptor
 * @constructor
 */
function Feature(x, y, descriptor) {
    this.x = x;
    this.y = y;
    this.descriptor = descriptor;
}

Feature.prototype = {

    /**
     * Euclidean distance of two features
     * @param {Feature} f2
     * @return {number}
     */
    diff: function(f2) {

    }
};


/**
 * Construct the scale space of the image
 * @param {Grayscale} img
 * @returns {Grayscale[]}
 */
function getScaleSpace(img) {
    var scaleSpace = [].constructor(SCALE);
    scaleSpace[0] = img;
    for (var scale=1; scale<SCALE; scale++) {
        scaleSpace[scale] = new Grayscale('image', { image: img })
        scaleSpace[scale].convolution(getGuassKernel(scale+1));
    }

    return scaleSpace;
}



/**
 * Construct octave space of the grayscale image
 * @param img
 * @returns {Grayscale[][]}
 */
function getOctaveSpace(img) {
    var octaveSpace = [].constructor(OCTAVE);
    var octave, width=img.width, height=img.height, base=img;
    var row, col, pre;
    for (octave=0; octave<OCTAVE; octave++) {
        if (octave > 0) {
            // create shrinked version of the previous octave
            width = Math.floor(width/2);
            height = Math.floor(height/2);
            base = new Grayscale('blank', { width: width, height: height });
            pre = octaveSpace[octave-1][0].data;
            for (row=0; row<height; row++) {
                for (col=0; col<width; col++) {
                    base.data[row][col] = Math.floor((pre[row*2][col*2]+pre[row*2+1][col*2]+pre[row*2][col*2+1]+pre[row*2+1][col*2+1])/4);
                }
            }
        }
        octaveSpace[octave] = getScaleSpace(base);
    }
    return octaveSpace;
}


/**
 *
 * @param {Grayscale[]} scaleSpace
 * @returns {Grayscale[]}
 */
var getDOGs = function(scaleSpace) {
    var DOGs = [].constructor(SCALE-1);
    for (var level=0; level<SCALE-1; level++) {
        DOGs[level] = scaleSpace[level].difference(scaleSpace[level+1]);
    }
    return DOGs;
};


/**
 * Find keypoints from the DOGs of one scale space
 * @param {Grayscale[]} dogs
 * @return {object[]}
 */
function getKeyPoints(dogs) {
    var width = dogs[0].width, height = dogs[0].height;
    var keypoints = [];
    var layer, row, col, x, y, z;
    var center, cursor, max, min, isLimit, limit;
    for(layer=1; layer<SCALE-2; layer++) {
        for (row=1; row<height-1; row++) {
            for (col=1; col<width-1; col++) {
                // for each non-border point in the DOG space
                center = dogs[layer].data[row][col];
                max = min = null;
                isLimit = true;
                for (x=-1; x<2 && isLimit; x++) {
                    for (y=-1; y<2 && isLimit; y++) {
                        for (z=-1; z<2 && isLimit; z++) {
                            cursor = dogs[layer+z].data[row+y][col+x];
                            if(!(x===0 && y===0 && z===0)) {
                                if (cursor > center && (max === null || cursor > max)) {
                                    max = cursor;
                                }
                                else if (cursor < center && (max === null || cursor < min)) {
                                    min = cursor;
                                }
                                else if (cursor === center && (max === null || min === null)) {
                                    max = cursor;
                                    min = cursor;
                                }
                            }
                            isLimit = !(max !== null && min !== null);
                        }
                    }
                }
                isLimit = !(max === null && min === null);
                limit = max || min;
                if (!isLimit) { break; }
                else if (Math.abs(center-limit) < CONTRACT_THRESHOLD) { break; }
                keypoints.push({ x: col, y: row });
            }
        }
    }
    return keypoints;
}



/**
 *
 * @param dogs
 */
var cornerFilter = function(dogs) {
    
};


/**
 *
 * @param {int} x
 * @param {int} y
 * @param {Grayscale} img
 * @return {object}
 */
var getDescriptor = function(x, y, img) {
    var centerOrientation;
    var neighboroOrientation = [];

};



/**
 * the main function of this file, calculate SIFT of the image
 *
 * @param data
 * @returns {}
 */
function sift(data) {
    var img = new Grayscale(data);
    var octaveSpace = getOctaveSpace(img);
    var features = [];
    var octave;
    for (octave=0; octave<OCTAVE; octave++) {
        var DOGs = getDOGs(octaveSpace[octave]);
        var keyPoints = getKeyPoints(DOGs);
        var featurePoints = _.filter(keyPoints, cornerFilter);
        features.push(_.map(featurePoints, getDescriptor));
    }
    return features;
}

window.SFM.sift = sift;