var numeric = require('numeric');

var sparse = require('./sparse-matrix'),
    SparseMatrix = sparse.SparseMatrix,
    SparseMatrixBuilder = sparse.SparseMatrixBuilder;


//var ZERO_THRESHOLD = Math.pow(10, -10);
var ZERO_THRESHOLD = 0;
var CAM_PARAMS = 9; // 3*R, 3*t, f, 2*p

function SBAContext(){

}


exports.sba = function(){};

exports.sparseJacobian = function(){};

exports.solveHessian = function(H, metadata){
    var records, tracksX;

    var A, V, W, transW;
    var invV;
};


/**
 * V is block diagnal
 * @param {SparseMatrix} V
 * @param {int[]} sizes
 */
exports.inverseV = function(V, sizes){
    var builder = new SparseMatrixBuilder(V.rows, V.cols);
    var offset = 0;
    sizes.forEach(function(size){
        var block = V.getBlock(offset, offset, offset+size, offset+size).toDense();
        var invBlock = numeric.inv(block);
        var r, c;
        for (c=0; c<size; c++) {
            for (r=0; r<size; r++) {
                builder.append(r+offset, c+offset, invBlock[r][c]);
            }
        }
        offset += size;
    });
    return builder.evaluate();
};