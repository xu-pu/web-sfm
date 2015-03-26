var sparse = require('../src/math/sparse-matrix.js'),
    SparseMatrix = sparse.SparseMatrix;

var sampleM = [
    [1,2,3,4,5],
    [1,2,0,4,5],
    [1,2,0,0,5],
    [1,2,3,0,5],
    [1,2,3,4,5]
];

var sps = SparseMatrix.fromDense(sampleM);
/*
var splited = sps.split(2,2);
console.log(splited.A.toDense());
console.log(splited.B.toDense());
console.log(splited.C.toDense());
console.log(splited.D.toDense());
    */

console.log(sps.getBlock(2,1,3,3).toDense());