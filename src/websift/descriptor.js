'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric');

var derivatives = require('../math/derivatives.js'),
    getGradient = derivatives.gradient,
    kernels = require('../math/kernels.js');

var RADIUS = 8,
    BINS = 8,
    BIN_SIZE = 2*Math.PI/BINS,
    VECTOR_LENGTH = 128,
    ENTRY_THRESHOLD = 0.2;


module.exports = siftDescriptor;


/**
 * @param {DoG} dog
 * @param {number} row
 * @param {number} col
 * @param {number} direction
 */
function siftDescriptor(dog, row, col, direction){

    console.log('describing feature points');

    var img = dog.img,
        sigma = dog.sigma;

    var transform = Matrix.create([
        [ Math.cos(direction), -Math.sin(direction), col ],
        [ Math.sin(direction),  Math.cos(direction), row ],
        [ 0                  ,  0                  , 1   ]
    ]);

    var weightFunction = kernels.getGuassian2d(sigma);

    var descriptor = new Float32Array(VECTOR_LENGTH); // 4*4*8

    var x, y;
    for (x=-RADIUS; x<=RADIUS; x++) {
        for (y=-RADIUS; y<=RADIUS; y++) {
            scanPoint()
        }
    }

    normalizeDescriptor(descriptor);

    console.log(descriptor);

    return {
        row: row,
        col: col,
        direction: direction,
        vector: descriptor
    };

    function scanPoint(){
        var block = Math.floor((x+8)/4)+4*Math.floor((y+8)/4),
            p = transform.x(Vector.create([x,y,1])).elements,
            row = p[1], col = p[0],
            gra = getGradient(img, row, col),
            bin = Math.round(gra.dir/BIN_SIZE);
        descriptor[block*8+bin] += gra.mag * weightFunction(x,y);
    }

}


function normalizeDescriptor(vector){
    var index;
    var norm = Vector.create(vector).norm2();
    for (index=0; index<vector.length; index++) {
        vector[index] = vector[index]/norm;
    }
    for (index=0; index<vector.length; index++) {
        if (vector[index] > ENTRY_THRESHOLD) {
            vector[index] = ENTRY_THRESHOLD;
        }
    }
    norm = Vector.create(vector).norm2();
    for (index=0; index<vector.length; index++) {
        vector[index] = vector[index]/norm;
    }
    return vector;
}