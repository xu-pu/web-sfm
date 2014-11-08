'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric');

var derivatives = require('../math/derivatives.js'),
    getGradient = derivatives.gradient,
    kernels = require('../math/kernels.js');

var GRID_WIDTH = 4,
    RADIUS = 8,
    BINS = 8,
    BIN_SIZE = 2*Math.PI/BINS,
    VECTOR_LENGTH = GRID_WIDTH*GRID_WIDTH*BINS,
    ENTRY_THRESHOLD = 0.2;


module.exports = siftDescriptor;


/**
 * @param {DoG} dog
 * @param {number} row
 * @param {number} col
 * @param {number} direction
 * @returns {Feature}
 */
function siftDescriptor(dog, row, col, direction){

    console.log('describing feature points');

    var img = dog.img,
        sigma = dog.sigma,
        weightFunction = kernels.getGuassian2d(sigma),
        hist = new HistGrid(row, col, direction, scale);

    var x, y;
    for (x=-RADIUS; x<=RADIUS; x++) {
        for (y=-RADIUS; y<=RADIUS; y++) {
            scanPoint()
        }
    }

    return {
        row: row,
        col: col,
        direction: direction,
        vector: hist.getVector()
    };

    function scanPoint(){
        var row = p[1], col = p[0],
            gra = getGradient(img, row, col),
            mag = gra.mag * weightFunction(x,y);
        hist.sample(row, col, mag, gra.dir)
    }

}


/**
 *
 * @param row
 * @param col
 * @param orientation
 * @param unit
 *
 * @property {Float32Array} vector
 * @property transform
 * @constructor

 */
function HistGrid(row, col, orientation, unit){

    this.vector = new Float32Array(VECTOR_LENGTH);

    this.transform = Matrix.create([
        [ Math.cos(orientation), -Math.sin(orientation), col ],
        [ Math.sin(orientation),  Math.cos(orientation), row ],
        [ 0                    ,  0                    , 1   ]
    ]);

    this.unit = unit;

}


/**
 *
 * @param row
 * @param col
 * @param mag
 * @param ori
 */
HistGrid.prototype.sample = function(row, col, mag, ori){

    var transform = this.transform,
        p = transform.x(Vector.create([x,y,1])).elements;

};


/**
 *
 * @param {int} rBin
 * @param {int} cBin
 * @param {number} mag
 * @param {number} ori
 */
HistGrid.prototype.add = function(rBin, cBin, mag, ori){

    var vector = this.vector,
        cursor = (rBin * GRID_WIDTH + cBin) * BINS,
        bin = ori/BIN_SIZE;


};



/**
 *
 * @returns {int[]}
 */
HistGrid.prototype.getVector = function(){
    var index, vector = this.vector;
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
};