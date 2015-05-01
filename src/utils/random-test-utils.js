'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var laUtils = require('../math/la-utils.js'),
    sparse = require('../math/sparse-matrix.js'),
    SparseMatrix = sparse.SparseMatrix;


var CAM_PARAMS = 11;
var POINT_PARAMS = 3;


/**
 * [ A , C ]
 * [ C', B ]
 * @param {int} cams
 * @param {int} points
 * @returns SparseMatrix
 */
exports.genSBAMatrix = function(cams, points){

    var sizeA = CAM_PARAMS*cams;
    var sizeB = POINT_PARAMS*points;
    var size = sizeA + sizeB;

    if (cams>0) {
        var sparseA = SparseMatrix.fromBlockDiag(_.range(cams).map(function(){
            return Matrix.Random(CAM_PARAMS, CAM_PARAMS).elements;
        }));
        var denseA = sparseA.toDense();
    }

    if (points>0) {
        var sparseB = SparseMatrix.fromBlockDiag(_.range(points).map(function(){
            return Matrix.Random(POINT_PARAMS, POINT_PARAMS).elements;
        }));
        var denseB = sparseB.toDense();
    }

    if (cams>0 && points>0) {
        var sparseC = SparseMatrix.Random(sizeA, sizeB, 0.3);
        var denseC = sparseC.toDense();
    }

    var r, c, buffer = Matrix.Zero(size, size).elements;
    for (r=0; r<size; r++) {
        for (c=0; c<size; c++) {
            if (r<sizeA && c<sizeA) {
                // A block
                buffer[r][c] = denseA[r][c];
            }
            else if (r<sizeA && c>=sizeA) {
                // C block
                buffer[r][c] = denseC[r][c-sizeA];
            }
            else if (r>=sizeA && c<sizeA) {
                // C' block
                buffer[r][c] = denseC[c][r-sizeA];
            }
            else {
                // B block
                buffer[r][c] = denseB[r-sizeA][c-sizeA];
            }
        }
    }

    return SparseMatrix.fromDense(buffer);

};