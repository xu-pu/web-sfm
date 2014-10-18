'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric');

var cord = require('../utils/cord.js'),
    getGradient = require('../math/gradient.js'),
    kernels = require('../math/kernels.js');

module.exports = siftDescriptor;


/**
 * @param {DoG} img
 * @param {number} row
 * @param {number} col
 * @param {number} direction
 */
function siftDescriptor(img, row, col, direction){

    console.log('describing feature points');

    var width = img.shape[1],
        height = img.shape[0];

    var RADIUS = 8;

    var point = cord.RCtoImg(row, col, width, height);

    var transform = Matrix.create([
        [Math.cos(direction), -Math.sin(direction), point.get(0,0)],
        [Math.sin(direction), Math.cos(direction), point.get(1,0)],
        [0,0,1]
    ]);

    var descriptor = new Float32Array(128); // 4*4*8

    _.range(-RADIUS, RADIUS).forEach(function(x){
        _.range(-RADIUS, RADIUS).forEach(function(y){

            var block = Math.floor((x+8)/4)+4*Math.floor((y+8)/4),
                imgPoint = transform.x(Vector.create([x,y,1])).elements,
                gra = getGradient(img, imgPoint[0], imgPoint[1]),
                bin = Math.floor((gra.dir+Math.PI)/(2*Math.PI/8));

            descriptor[block*8+bin] += gra.mag;

        })
    });

    console.log(descriptor);

    return {
        row: row,
        col: col,
        vector: descriptor
    };

}