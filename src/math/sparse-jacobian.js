'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var sparse = require('./sparse-matrix.js'),
    SparseMatrix = sparse.SparseMatrix,
    SparseMatrixBuilder = sparse.SparseMatrixBuilder;

//=======================================================


/**
 * Get sparse Jacobian matrix
 * @param {function(Vector):Vector} func - f(vx) => vy
 * @param {Vector} x - start point x0[]
 * @returns SparseMatrix
 */
module.exports = function(func, x){

};