var numeric = require('numeric'),
    sub = numeric.sub,
    dot = numeric.dot,
    transpose = numeric.transpose;

var sparse = require('./sparse-matrix'),
    SparseMatrix = sparse.SparseMatrix,
    SparseMatrixBuilder = sparse.SparseMatrixBuilder;


//var ZERO_THRESHOLD = Math.pow(10, -10);
var DELTA = Math.pow(10, -6);
var ZERO_THRESHOLD = 0;
var CAM_PARAMS = 9; // 3*R, 3*t, f, 2*p

exports.sba = function(){};


/**
 *
 * @param {Function} func - number[]=>number[]
 * @param {number[]} x
 * @returns SparseMatrixa
 */
exports.sparseJacobian = function(func, x){

    var y = func(x),
        xx = x.slice(),
        xs = x.length,
        ys = y.length;

    var builder = new SparseMatrixBuilder(ys, xs);

    var curY, curC, curR, curV;

    for (curC=0; curC<xs; curC++) {
        xx[curC] = xx[curC] + DELTA;
        curY = func(xx);
        xx[curC] = xx[curC] - DELTA;
        for (curR=0; curR<ys; curR++) {
            curV = (curY[curR] - y[curR]) / DELTA;
            if (curV !== 0) {
                builder.append(curR, curC, curV);
            }
        }
    }

    return builder.evaluate();

};


/**
 *
 * @param {SparseMatrix} H
 * @param {number[]} sigma
 * @param {int} cams
 * @param {int[]} sizes
 */
exports.solveHessian = function(H, sigma, cams, sizes){

    var offset = cams*CAM_PARAMS,
        sigmaA = sigma.slice(0, offset),
        sigmaB = sigma.slice(offset),
        splited = H.split(offset, offset),
        U = splited.A.toDense(),
        V = splited.C,
        W = splited.B,
        transW = splited.C,
        invV = exports.inverseV(V, sizes);

    var param1 = sub(U, W.x(invV).x(transW)), // U - W * V-1 * Wt
        param2 = sub(sigmaA, dot(W.x(invV).toDense(), sigmaB)), // sigmaA - W * V-1 * sigmaB
        deltaA = dot(numeric.inv(param1), param2),
        sparseDeltaA = SparseMatrix.fromDenseVector(deltaA),
        sparseSigmaB = SparseMatrix.fromDenseVector(sigmaB),
        deltaB = invV.x(sparseSigmaB.subtract(transW.x(sparseDeltaA))).toDense();

    return transpose(deltaA.concat(deltaB));

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