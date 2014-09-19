'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports = getRotation;


function getRotation(x,y,z){
    return rotateX(x).x(rotateY(y)).x(rotateZ(z));
}


function rotateX(angle){
    return Matrix.create([
        [1,0,0],
        [0, Math.cos(angle), Math.sin(angle)],
        [0, -Math.sin(angle), Math.cos(angle)]
    ]);
}


function rotateY(angle){
    return Matrix.create([
        [Math.cos(angle), 0, Math.sin(angle)],
        [0,1,0],
        [-Math.sin(angle), 0, Math.cos(angle)]
    ]);
}


function rotateZ(angle){
    return Matrix.create([
        [Math.cos(angle), Math.sin(angle), 0],
        [-Math.sin(angle), Math.cos(angle), 0],
        [0,0,1]
    ]);
}
