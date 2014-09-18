'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports.getProjectionMatrix = getProjectionMatrix;

function getProjectionMatrix(R, t, focal, width, height){

    var K = Matrix.create([
        [-focal, 0     , width/2 , 0],
        [0     , -focal, height/2, 0],
        [0     , 0     , 1       , 0]
    ]);

    var P = R.augment(t).transpose().augment(Vector.create([0,0,0,1])).transpose();

    return K.x(P);

}