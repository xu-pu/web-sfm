'use strict';

window.SFM = SFM || {};

/**
 *
 * Grayscale Image
 *
 * @constructor
 * @class
 *
 * @property {int} width
 * @property {int} height
 * @property {Uint8Array} data
 *
 * @param {object} options
 * @param {SFM.Grayscale} [options.image]
 * @param {object} [options.canvas]
 * @param {int} [options.width]
 * @param {int} [options.height]
 */
SFM.Grayscale = function(options) {

    var row, col;
    if (options.canvas) {
        this.allocate(options.canvas.width, options.canvas.height);
        var offset, data = options.canvas.data;
        for (row=0; row<options.canvas.height; row++) {
            for (col=0; col<options.canvas.width; col++) {
                offset = 4 * (options.canvas.width * row + col);
                this.data[row][col] = Math.floor(SFM.RGB2GRAY_R * data[offset] + SFM.RGB2GRAY_G * data[offset+1] + SFM.RGB2GRAY_B * data[offset+2]);
            }
        }
    }
    else if (options.image){
        this.allocate(options.image.width, options.image.height);
        for (row=0; row<this.height; row++) {
            for (col=0; col<this.width; col++) {
                this.data[row][col] = options.image.data[row][col];
            }
        }
    }
    else if (options.width && options.height) {
        this.allocate(options.width, options.height);
    }
    else {
        console.log("options is invalid");
    }
};

SFM.Grayscale.prototype = {

    /**
     *
     * @param {number} row
     * @param {number} col
     * @returns {number}
     */
    getRC: function(row, col){
        if(row>=0 && col>=0 && col<this.width && row<this.height){
            return this.data[col+this.width*row];
        }
        else {
            throw 'pixel does not exists';
        }
    },

    /**
     *
     * @param {number} row
     * @param {number} col
     * @param {number} value
     */
    setRC: function(row, col, value){
        if(row>=0 && col>=0 && col<this.width && row<this.height){
            this.data[col+this.width*row] = value;
        }
        else {
            throw 'pixel does not exists';
        }
    },


    /**
     *
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    getPixel: function(x, y){
        return this.getRC(this.height-1-y, x);
    },

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} value
     */
    setPixel: function(x, y, value){
        this.setRC(this.height-1-y, x, value);
    },


    getPoint: function(){},


    /**
     * creat new empty image array
     *
     * @param {int} width
     * @param {int} height
     */
    allocate: function(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint8Array(width*height);
    },


    /**
     * access extended version of the image
     * when convoluting an image, image border needs to be extended, this function will do the border extension
     * if boder extension is not needed, just use image.data array
     *
     * @param {int} x
     * @param {int} y
     * @returns {int}
     */
    get : function(x, y) {
        var cor = this.toPixel(x,y);
        return this.getPixel(cor[0], cor[1]);
    },

    toPixel: function(x, y){
        x=Math.round(x);
        y=Math.round(y);
        if (x>=this.width-1) {
            x = this.width-1;
        }
        else if (x<0) {
            x = 0;
        }
        if (y>=this.height-1) {
            y = this.height-1;
        }
        else if (y<0) {
            y = 0;
        }
        return [x,y];
    },

    /**
     * Calculate gradient of a point
     * @param {int} x
     * @param {int} y
     * @return {object}
     */
    getGradient: function(x, y) {
        var xGradient = this.getPointConvolution(x, y, SFM.SOBEL_KERNEL_X);
        var yGradient = this.getPointConvolution(x, y, SFM.SOBEL_KERNEL_Y);
        var dir = Math.atan2(yGradient, xGradient);
        var mag = yGradient/Math.sin(dir);
        return {
            dir: dir,
            mag: mag
        };
    },


    /**
     * Convolution at a point
     * @param {int} x
     * @param {int} y
     * @param {(number[][]|SFM.Matrix)} kernel
     * @return {number}
     */
    getPointConvolution: function(x, y, kernel){
        var cor = this.toPixel(x,y);
        x = cor[0];
        y = cor[1];
        var offsetRow, offsetCol, pixel=0, radius;
        if (kernel.constructor === []) {
            radius=(kernel.length-1)/2;
            for (offsetRow=-radius; offsetRow<radius+1; offsetRow++) {
                for (offsetCol=-radius; offsetCol<radius+1; offsetCol++) {
                    pixel += kernel[radius+offsetRow][radius+offsetCol] * this.get(x+offsetCol, y+offsetRow);
                }
            }
        }
        else {
            radius = (kernel.rows-1)/2;
            for (offsetRow=-radius; offsetRow<radius+1; offsetRow++) {
                for (offsetCol=-radius; offsetCol<radius+1; offsetCol++) {
                    pixel += kernel.get(radius+offsetRow, radius+offsetCol) * this.get(x+offsetCol, y+offsetRow);
                }
            }
        }
        return pixel;
    },


    /**
     * Concolute the image with the kernel
     * @param {number[][]} kernel
     * @return {SFM.Grayscale}
     */
    convolution: function(kernel) {
        var row, col,
            result = new SFM.Grayscale({ width: this.width, height: this.height });
        for (row=0; row<this.height; row++) {
            for (col=0; col<this.width; col++) {
                result.data[row][col] = this.getPointConvolution(col, row, kernel);
            }
        }
        return result;
    },

    /**
     *
     * @param {SFM.Grayscale} img
     * @returns {SFM.Grayscale}
     */
    difference: function(img) {
        var result = new SFM.Grayscale({ width: this.width, height: this.height });
        var x, y;
        for (y=0; y<this.height; y++) {
            for (x=0; x<this.width; x++) {
                result.setPixel(x, y, Math.abs(this.getPixel(x,y)-img.getPixel(x, y)));
            }
        }
        return result;
    }

};