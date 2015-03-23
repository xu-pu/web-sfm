'use strict';

var numeric = require('numeric');

exports.SparseMatrix = SparseMatrix;
exports.SparseMatrixBuilder = SparseMatrixBuilder;

//===========================================================

/**
 * Column compressed sparse matrix
 *
 * @property {boolean} isSparse
 *
 * @constructor
 */
function SparseMatrix(sparse, rows, cols){
    this.sparse = sparse;
    this.rows = rows;
    this.cols = cols;
}


SparseMatrix.prototype.slice = function(top, left, bottom, right){

};


/**
 * Split the matrix into 4 parts
 * [ A, B ]
 * [ C, D ]
 * @param rows - rows of A
 * @param cols - cols of A
 * @returns {{ A: SparseMatrix, B: SparseMatrix, C: SparseMatrix, D: SparseMatrix }}
 */
SparseMatrix.prototype.split = function(rows, cols){

    var width = this.cols,
        height = this.rows,
        elements = this.sparse[2],
        bounds = this.sparse[0],
        cords = this.sparse[1];

    var builderA = new SparseMatrixBuilder(rows, cols),
        builderB = new SparseMatrixBuilder(rows, width-cols),
        builderC = new SparseMatrixBuilder(height-rows ,cols),
        builderD = new SparseMatrixBuilder(height-rows, width-cols);

    var i, curV, curR, curC=0;
    for (i=0; i< elements.length; i++) {

        curV = elements[i];
        curR = cords[i];
        curC = findC(curC);

        if (curR<rows && curC<cols) {
            //block A
            builderA.append(curR, curC, curV);
        }
        else if (curR<rows && curC>=cols) {
            //block B
            builderB.append(curR, curC-cols, curV);
        }
        else if (curR>=rows && curC<cols) {
            //block C
            builderC.append(curR-rows, curC,curV);
        }
        else {
            //block D
            builderD.append(curR-rows, curC-cols,curV);
        }

    }

    function findC(c){
        if (bounds[c+1] > i) {
            return c;
        }
        else {
            return findC(c+1);
        }
    }

    return {
        A: builderA.evaluate(),
        B: builderB.evaluate(),
        C: builderC.evaluate(),
        D: builderD.evaluate()
    };

};


/**
 *
 * @param {SparseMatrix} m
 * @returns SparseMatrix
 */
SparseMatrix.prototype.x = function(m){
    return new SparseMatrix(numeric.ccsDot(this.sparse, m.sparse), this.rows, m.cols);
};


/**
 * @returns number[][]
 */
SparseMatrix.prototype.toDense = function(){
    return numeric.ccsFull(this.sparse);
};


/**
 *
 * @param {number[][]} m
 * @returns {SparseMatrix}
 */
SparseMatrix.fromDense = function(m){
    return new SparseMatrix(numeric.ccsSparse(m), m.length, m[0].length)
};

//=====================================

function SparseMatrixBuilder(rows, cols){
    this.bounds = [0];
    this.cords = [];
    this.elements = [];
    this.rows = rows;
    this.cols = cols;
    this.curC = 0
}

SparseMatrixBuilder.prototype.append = function(row,col,v){

    var _self = this,
        bounds = this.bounds,
        cords = this.cords,
        elements = this.elements,
        curC = this.curC;

    fillBounds();
    elements.push(v);
    cords.push(row);

    function fillBounds(){
        if (curC < col) {
            bounds.push(elements.length);
            curC = _self.curC = curC+1;
            fillBounds();
        }
    }

};

SparseMatrixBuilder.prototype.evaluate = function(){
    var rows = this.rows,
        cols = this.cols,
        bounds = this.bounds,
        cords = this.cords,
        elements = this.elements;
    bounds.push(elements.length);
    return new SparseMatrix([bounds, cords, elements], rows, cols);
};