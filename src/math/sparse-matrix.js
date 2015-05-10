'use strict';

var _ = require('underscore'),
    numeric = require('numeric'),
    toFull = numeric.ccsFull,
    toSparse = numeric.ccsSparse,
    transpose = numeric.transpose;

var shortcuts = require('../utils/shortcuts.js');

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

//============================
// Special Constructors
//============================

/**
 *
 * @param {int} n
 * @returns SparseMatrix
 */
SparseMatrix.I = function(n){
    var builder = new SparseMatrixBuilder(n, n);
    for (var i=0; i<n; i++) {
        builder.append(i, i, 1);
    }
    return builder.evaluate();
};

/**
 *
 * @param {int} rows
 * @param {int} cols
 * @param {number} [ratio] - 0 to 1
 */
SparseMatrix.Random = function(rows, cols, ratio){

    ratio = ratio || 0.5;
    var builder = new SparseMatrixBuilder(rows, cols);

    var r, c;
    for (c=0; c<cols; c++) {
        for (r=0; r<rows; r++) {
            if (Math.random() < ratio) {
                builder.append(r, c, Math.random());
            }
        }
    }

    return builder.evaluate();

};

/**
 * @param {number[][][]} diag
 * @returns SparseMatrix
 */
SparseMatrix.fromBlockDiag = function(diag){
    var rows = diag.reduce(function(memo, block){
            return memo + block.length
        }, 0),
        cols = diag.reduce(function(memo, block){
            return memo + block[0].length;
        }, 0);

    var builder = new SparseMatrixBuilder(rows, cols),
        rowOffset = 0, colOffset = 0;

    diag.forEach(function(block){

        var rs = block.length,
            cs = block[0].length;

        var r, c;
        for (c=0; c<cs; c++) {
            for (r=0; r<rs; r++) {
                builder.append(rowOffset+r, colOffset+c, block[r][c]);
            }
        }

        rowOffset += rs;
        colOffset += cs;

    });

    return builder.evaluate();

};

/**
 *
 * @param {number[][]} m
 * @returns {SparseMatrix}
 */
SparseMatrix.fromDense = function(m){
    return new SparseMatrix(toSparse(m), m.length, m[0].length)
};


/**
 *
 * @param {number[]} V
 * @returns {SparseMatrix}
 */
SparseMatrix.fromDenseVector = function(V){
    var dense = numeric.transpose([V]);
    return new SparseMatrix(toSparse(dense), V.length, 1);
};

//============================
// Matrix Operations
//============================

/**
 *
 * @param {SparseMatrix} m
 * @returns {SparseMatrix}
 */
SparseMatrix.prototype.add = function(m){
    return new SparseMatrix(numeric.ccsadd(this.sparse, m.sparse), this.rows, this.cols);
};

/**
 *
 * @param {SparseMatrix} m
 * @returns {SparseMatrix}
 */
SparseMatrix.prototype.subtract = function(m){
    return new SparseMatrix(numeric.ccssub(this.sparse, m.sparse), this.rows, this.cols);
};

/**
 *
 * @param {SparseMatrix} a
 * @returns {SparseMatrix}
 */
SparseMatrix.prototype.times = function(a){
    return new SparseMatrix(numeric.ccsmul(this.sparse, a), this.rows, this.cols);
};

/**
 *
 * @returns {SparseMatrix}
 */
SparseMatrix.prototype.transpose = function(){
    var gathered = numeric.ccsGather(this.sparse);
    var transposed = _.zip(gathered[0],gathered[1], gathered[2])
        .map(function(entry){
            return [entry[1], entry[0], entry[2]];
        })
        .sort(function(a, b){
            if (a[1] < b[1]) {
                return -1;
            }
            else if (a[1] > b[1]) {
                return 1;
            }
            else if (a[0] < b[0]) {
                return -1;
            }
            else if (a[0] > b[0]) {
                return 1;
            }
            else {
                return 0;
            }
        });
    var regather = _.zip.apply(null, transposed);
    return new SparseMatrix(numeric.ccsScatter(regather), this.cols, this.rows);
};

/**
 *
 * @param {int} top
 * @param {int} left
 * @param {int} bottom
 * @param {int} right
 * @returns {SparseMatrix}
 */
SparseMatrix.prototype.getBlock = function(top, left, bottom, right){

    var bulder = new SparseMatrixBuilder(bottom-top+1, right-left+1),
        bounds = this.sparse[0],
        cords = this.sparse[1],
        elements = this.sparse[2],
        offsetR = top,
        offsetC = left;

    var curC, curR, curEle,
        colHead, colTail;
    for (curC=left; curC<=right; curC++) {
        colHead = bounds[curC];
        colTail = bounds[curC+1];
        for (curEle=colHead; curEle<colTail; curEle++) {
            curR = cords[curEle];
            if (curR>=top && curR<=bottom) {
                bulder.append(curR-offsetR, curC-offsetC, elements[curEle])
            }
        }
    }

    return bulder.evaluate();

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

SparseMatrix.prototype.iter = function(callback){
    var gathered = numeric.ccsGather(this.sparse),
        rows = gathered[0],
        cols = gathered[1],
        vs = gathered[2];
    var length = gathered[0].length;
    for (var i=0; i<length; i++) {
        callback(rows[i], cols[i], vs[i]);
    }
};


/**
 * @returns number[][]
 */
SparseMatrix.prototype.toDense = function(){

    var full = toFull(this.sparse),
        rows = this.rows,
        cols = this.cols,
        rs = full.length,
        cs = full[0].length,
        deltaR = rows-rs,
        deltaC = cols-cs;

    if (deltaC>0) {
        full = full.map(function(row){
            return row.concat(shortcuts.zeros(deltaC));
        });
    }

    if (deltaR>0) {
        _.range(deltaR).forEach(function(){
            full.push(shortcuts.zeros(cols));
        });
    }

    return full;

};


/**
 * @returns {number[]}
 */
SparseMatrix.prototype.toDenseVector = function(){
    if (this.cols === 1) {
        return this.transpose().toDense()[0];
    }
    else {
        throw 'not a vector';
    }
};


//=====================================

/**
 *
 * @param {int} rows
 * @param {int} cols
 * @constructor
 */
function SparseMatrixBuilder(rows, cols){
    this.bounds = [0];
    this.cords = [];
    this.elements = [];
    this.rows = rows;
    this.cols = cols;
    this.curC = 0
}


/**
 *
 * @param {int} row
 * @param {int} col
 * @param {number} v
 */
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


/**
 *
 * @returns {SparseMatrix}
 */
SparseMatrixBuilder.prototype.evaluate = function(){
    var rows = this.rows,
        cols = this.cols,
        bounds = this.bounds,
        cords = this.cords,
        elements = this.elements;
    var currentCols = bounds.length;
    for (currentCols; currentCols<=cols; currentCols++) {
        bounds.push(elements.length);
    }
    return new SparseMatrix([bounds, cords, elements], rows, cols);
};