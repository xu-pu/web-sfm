'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var settings = require('./settings.js'),
    CONTRAST_THRESHOLD = settings.CONTRAST_THRESHOLD,
    DETECTION_BORDER = settings.DETECTION_BORDER,
    CURVATURE_THRESHOLD = settings.EDGE_CURVATURE_THRESHOLD;

//================================================================


/**
 *
 * @param {DogPyramid} dogspace
 * @param {GuassianPyramid} scales
 * @param {function} callback -- callback when feature is detected
 */
exports.detect = function(dogspace, scales, callback){

    _.range(1, dogspace.pyramid.length-1).forEach(function(layer){

        exports.scanLayer(dogspace, layer, function(row, col){
            var subpixel = exports.subpixel(dogspace, row, col, layer);
            if (subpixel) {
                if (exports.isNotEdge(dogspace.pyramid[layer], row, col)) {
                    callback({
                        row   : subpixel.row,
                        col   : subpixel.col,
                        scale : subpixel.scale,
                        octave: scales.octave,
                        layer : layer
                    });
                }
            }
        })

    });

};


/**
 * @param {DogPyramid} dogspace
 * @param {int} layer
 * @param {Function} callback
 */
exports.scanLayer = function(dogspace, layer, callback){

    console.log('detecting feature points');

    var img = dogspace.pyramid[layer].img,
        width = img.shape[0],
        height = img.shape[1],
        contrastWindow = [-1,0,1];


    var row, col;

    for (row=DETECTION_BORDER; row<height-DETECTION_BORDER; row++) {
        for (col=DETECTION_BORDER; col<width-DETECTION_BORDER; col++) {

            (function(){

                var center = img.get(col, row),
                    max = -Infinity,
                    min = Infinity;

                if (Math.abs(center) < CONTRAST_THRESHOLD/2) {
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
                                return center < min || center > max;
                            }
                        });
                    });
                });

                if (isLimit) {
                    callback(row, col);
                }

            })();

        }
    }

};


/**
 *
 * @param {DogPyramid} space
 * @param {int} row
 * @param {int} col
 * @param {int} layer
 * @returns {Vector}
 */
exports.deriv3D = function(space, row, col, layer){

    var dx = ( space.get(row, col+1, layer) - space.get(row, col-1, layer) ) / 2,
        dy = ( space.get(row+1, col, layer) - space.get(row-1, col, layer) ) / 2,
        ds = ( space.get(row, col, layer+1) - space.get(row, col, layer-1) ) / 2;

    return Vector.create([dx, dy, ds]);

};


/**
 * Subpixel interpolation and contrast filter
 * @param {DogPyramid} dogs
 * @param {int} r
 * @param {int} c
 * @param {int} layer
 * @returns {null|Subpixel}
 */
exports.subpixel = function(dogs, r, c, layer){

    var intR = r,
        intC = c,
        intL = layer,
        deriv = exports.deriv3D(dogs, intR, intC, intL),
        hess = exports.hessian(dogs, intR, intC, intL),
        delta = hess.inverse().x(deriv).x(-1),
        subR = delta.e(2),
        subC = delta.e(1),
        subL = delta.e(3),
        contrast = Math.abs(dogs.get(r, c, layer) + 0.5 * deriv.dot(delta));

    if (Math.abs(subR) < 1 && Math.abs(subC) < 1 && Math.abs(subL) < 1 && contrast > CONTRAST_THRESHOLD) {
        return {
            row  : intR + subR,
            col  : intC + subC,
            scale: intL + subL
        };
    }
    else {
        return null;
    }

};



/**
 * Get Hessian Matrix of a integral point in DoG space
 * @param {DogPyramid} space
 * @param {int} row
 * @param {int} col
 * @param {int} layer
 * @return {Matrix}
 */
exports.hessian = function(space, row, col, layer){

//    console.log(row + ',' + col + ',' + layer);

    var v   = space.get(row, col, layer),
        dxx = ( space.get(row, col+1, layer) + space.get(row, col-1, layer) - 2 * v ),
        dyy = ( space.get(row+1, col, layer) + space.get(row-1, col, layer) - 2 * v ),
        dss = ( space.get(row, col, layer+1) + space.get(row, col, layer-1) - 2 * v ),
        dxy = (
            space.get(row+1, col+1, layer) -
            space.get(row+1, col-1, layer) -
            space.get(row-1, col+1 ,layer) +
            space.get(row-1, col-1, layer) ) / 4.0,
        dxs = (
            space.get(row, col+1, layer+1) -
            space.get(row, col-1, layer+1) -
            space.get(row, col+1 ,layer-1) +
            space.get(row, col-1, layer-1) ) / 4.0,
        dys = (
            space.get(row+1, col, layer+1) -
            space.get(row-1, col, layer+1) -
            space.get(row+1, col ,layer-1) +
            space.get(row-1, col, layer-1) ) / 4.0;

    return Matrix.create([
        [dxx, dxy, dxs],
        [dxy, dyy, dys],
        [dxs, dys, dss]
    ]);

};



/**
 * Filter the detected point by its principal curvature
 * @param {DoG} dog
 * @param {int} row
 * @param {int} col
 * @returns {Boolean}
 */
exports.isNotEdge = function(dog, row, col) {

    var img = dog.img,
        v   = img.get(col, row),
        dxx = ( img.get(col+1, row) + img.get(col-1, row) - 2 * v ),
        dyy = ( img.get(col, row+1) + img.get(col, row-1) - 2 * v ),
        dxy = ( img.get(col+1, row+1) - img.get(col-1, row+1) - img.get(col+1, row-1) + img.get(col-1, row-1) ) / 4,
        H = Matrix.create([
            [ dxx, dxy ],
            [ dxy, dyy ]
        ]),
        det = H.det(),
        tr = dxx + dyy;

    if (det < 0) {
        // det of H is unlikely to be negative, if so, discard the point as edge
        return true;
    }
    else {
        return tr*tr/det < CURVATURE_THRESHOLD;
    }

};