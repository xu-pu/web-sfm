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
 * @param {function} callback
 */
exports.detector = function(dogspace, scales, callback){

    _.range(1, dogspace.pyramid.length-1).forEach(function(layer){

        var scale = scales.pyramid[layer];

        exports.detect(dogspace, layer, function(row, col){
            var detectedF = { row: row, col: col, octave: scales.octave, layer: layer };
            callback(scale, detectedF);
        })

    });

};


/**
 * @param {DogPyramid} dogspace
 * @param {int} layer
 * @param {Function} callback
 */
exports.detect = function(dogspace, layer, callback){

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
                    min = Infinity,
                    subpixel;

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
                    subpixel = exports.subpixel(dogspace, row, col, layer);
                    if (subpixel && Math.abs(subpixel.value) > CONTRAST_THRESHOLD) {
                        callback(subpixel.row, subpixel.col);
                    }
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

    var dxx = ( space.get(row, col+1, layer) - space.get(row, col-1, layer) ) / 2,
        dyy = ( space.get(row+1, col, layer) - space.get(row-1, col, layer) ) / 2,
        dss = ( space.get(row, col, layer+1) - space.get(row, col, layer-1) ) / 2;

    return Vector.create([dxx, dyy, dss]);

};


/**
 *
 * @param {DogPyramid} dogs
 * @param {int} r
 * @param {int} c
 * @param {int} layer
 * @returns {null|Subpixel}
 */
exports.subpixel = function(dogs, r, c, layer){

    var intR = r, intC = c, intLayer = layer;

    var deriv, hess, delta;

    deriv = exports.deriv3D(dogs, intR, intC, intLayer);
    hess = exports.hessian(dogs, intR, intC, intLayer);
    delta = hess.inverse().x(deriv).x(-1);

    var subR = delta.e(2),
        subC = delta.e(1),
        subLayer = delta.e(3);

    if (Math.abs(subR) < 1 && Math.abs(subC) < 1 && Math.abs(subLayer) < 1) {
        return {
            row: intR+subR,
            col: intC+subC,
            layer: intLayer+subLayer,
            value: dogs.get(intR, intC, intLayer) + deriv.dot(delta)/2
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
        dxy = 0.25 * ( img.get(col+1, row+1) - img.get(col-1, row+1) - img.get(col+1, row-1) + img.get(col-1, row-1) );

    /*
    var H = Matrix.create([
            [ dxx(img, row, col), dxy(img, row, col) ],
            [ dyx(img, row, col), dyy(img, row, col) ]
        ]),
        det = H.det(),
        tr = H.e(1,1) + H.e(2,2);
    */

    var H = Matrix.create([
            [ dxx, dxy ],
            [ dxy, dyy ]
        ]),
        det = H.det(),
        tr = H.e(1,1) + H.e(2,2);

    if (det < 0) {
        // det of H is unlikely to be negative, if so, discard the point as edge
        return true;
    }
    else {
        return tr*tr/det < CURVATURE_THRESHOLD;
    }

};