'use strict';

window.SFM = window.SFM || {};

/**
 * @param {SFM.Matrix} [options.matrix]
 * @param {int} [options.cols]
 * @param {int} [options.rows]
 * @param {number[][]|number[]} [options.array]
 * @constructor
 */
SFM.Matrix = function(options){
    this.dataType = options.type || this.DATA_FLOAT;
    if (options.array) {
        // from a native array based matrix
        this.rows = options.array.length;
        this.cols = options.array[0].length;
        this.allocate();
        var r, c;
        for (r=0; r<this.rows; r++) {
            for (c=0; c<this.cols; c++) {
                this.set(r, c, options.array[r][c]);
            }
        }
    }
    else if (options.matrix) {
        // copy a matrix
        this.rows = options.matrix.rows;
        this.cols = options.matrix.cols;
        this.allocate();
        this.data.set(options.matrix.data);
    }
    else if (options.rows && options.cols) {
        // create empty matrix
        this.rows = options.rows;
        this.cols = options.cols;
        this.allocate();
    }
};

SFM.Matrix.prototype = {

    DATA_UINT: 0,
    DATA_INT: 1,
    DATA_FLOAT: 2,


    allocate: function(){
        switch (this.dataType) {
            case this.DATA_FLOAT:
                this.data = new Float32Array(this.rows*this.cols);
                break;
            case this.DATA_INT:
                this.data = new Int32Array(this.rows*this.cols);
                break;
            case this.DATA_UINT:
                this.data = new Uint8Array(this.rows*this.cols);
                break;
            default:
                this.data = new Float32Array(this.rows*this.cols);
                break;
        }
    },


    get: function(row, col){
        return this.data[col+this.cols*row];
    },


    set: function(row, col, value){
        this.data[col+this.cols*row] = value;
    },

    /**
     *
     * @param {int} row
     * @return {SFM.Matrix}
     */
    getRow: function(row){
        if  (row>=this.rows) {
            throw 'row does not exist';
        }
        else {
            var result = new SFM.Matrix({ cols: this.cols, rows: 1 });
            _.each(_.range(this.cols), function(col){
                result.set(0, col, this.get(row, col));
            }, this);
            return result;
        }
    },

    /**
     *
     * @param {int} col
     * @return {SFM.Matrix}
     */
    getCol: function(col){
        if  (col>=this.cols) {
            throw 'column does not exist';
        }
        else {
            var result = new SFM.Matrix({ cols: 1, rows: this.rows });
            _.each(_.range(this.rows), function(row){
                result.set(row, 0, this.get(row, col));
            }, this);
            return result;
        }
    },


    getNativeRows: function(){
        return _.map(_.range(this.rows), function(row){
            return _.map(_.range(this.cols), function(col){
                return this.get(row, col);
            }, this);
        }, this);
    },


    getNativeCols: function(){
        return _.map(_.range(this.cols), function(col){
            return _.map(_.range(this.rows), function(row){
                return this.get(row, col);
            }, this);
        }, this);
    },


    TYPE_SCALAR: 0,
    TYPE_VECTOR: 1,
    TYPE_SQUARE: 2,
    TYPE_RECT: 3,

    getType: function(){
        if (this.rows === this.cols) {
            if (this.rows === 1){
                return this.TYPE_SCALAR;
            }
            else {
                return this.TYPE_SQUARE;
            }
        }
        else if (this.rows === 1 || this.cols === 1) {
            return this.TYPE_VECTOR;
        }
        else {
            return this.TYPE_RECT;
        }
    },


    transpose: function(){
        return new SFM.Matrix({ array: this.getNativeCols() });
    },


    inverse: function(){
        if (this.getType() !== this.TYPE_SQUARE) {
            throw 'non-square matrix can not inverse';
        }
        return new SFM.Matrix({ array: numeric.inverse(this.getNativeRows()) });
    },


    /**
     *
     * @returns {number}
     */
    det: function(){
        return numeric.det(this.getNativeRows());
    },


    /**
     *
     * @param {(SFM.Matrix|number[][]|number[]|number)} M
     * @returns {SFM.Matrix|number}
     */
    dot: function(M){
        if (typeof M === 'number') {
            var scalarDot = new SFM.Matrix({ matrix: this });
            _.each(scalarDot.data.length, function(index){
                scalarDot.data[index] *= M;
            });
            return scalarDot;
        }
        else if (M.constructor === [] && M[0].constructor === []){
            // valid array matrix
            M = new SFM.Matrix({ array: M });
        }
        else if (M.constructor === [] && typeof M[0] === 'number' && M.length === this.rows) {
            // vector
            M = new SFM.Matrix({ array: [M] }).transpose();
        }

        if (this.cols !== M.rows) {
            throw 'matrices are not compatiable';
        }
        var result = new SFM.Matrix({ array: numeric.dot(this.getNativeRows(), M.getNativeRows()) });
        if (result.getType() === this.TYPE_SCALAR) {
            return result.get(0,0);
        }
        else {
            return result;
        }
    },

    /**
     *
     * @param {SFM.Matrix} m
     */
    add: function(m){
        if (m.rows === this.rows && m.cols === this.cols) {
            return new SFM.Matrix({ array: numeric.add(this.getNativeRows(), m.getNativeRows()) });
        }
        else {
            throw 'only matrices with same size can be added';
        }
    },

    /**
     *
     * @param {SFM.Matrix} m
     */
    sub: function(m){
        if (m.rows === this.rows && m.cols === this.cols) {
            return new SFM.Matrix({ array: numeric.sub(this.getNativeRows(), m.getNativeRows()) });
        }
        else {
            throw 'only matrices with same size can be substracted';
        }
    },

    /**
     * @return {SFM.Matrix}
     */
    cross: function(){
        if (this.rows === 3 && this.cols === 1) {
            var result = new SFM.Matrix({ rows: 3, cols: 3 });
            result.set(0,1, this.get(2,0)*-1);
            result.set(1,0, this.get(2,0));
            result.set(0,2, this.get(1,0));
            result.set(2,0, this.get(1,0)*-1);
            result.set(1,2, this.get(0,0)*-1);
            result.set(2,1, this.get(0,0));
            return result;
        }
        else {
            throw 'only support 3*1 vector';
        }

    },

    normalize: function(){
        this.dot(1/this.l2Norm());
    },

    l2Norm: function(){
        return Math.sqrt(_.reduce(this.data, function(sum, num){ return sum+num*num }, 0));
    },

    /**
     *
     * @param {int} row -- left-top-corner
     * @param {int} col -- left-top-corner
     * @param {int} rows -- size
     * @param {int} cols -- size
     * @return {SFM.Matrix}
     */
    subMatrix: function(row, col, rows, cols){
        var result = new SFM.Matrix({ rows: rows,  cols: cols, type: this.dataType });
        var r, c;
        for (r=0; r<rows; r++) {
            for(c=0; c<cols; c++){
                result.set(r, c, this.get(row+r,col+c));
            }
        }
        return result;
    },


    /**
     * U - rows*rows
     * D - rows*cols
     * V - cols*cols
     * @returns {{U: SFM.Matrix, D: SFM.Matrix, V: SFM.Matrix}}
     */
    svd: function(){
        var result, U, V, D;
        if (this.rows>this.cols) {
            result = numeric.svd(this.getNativeRows());
            U = new SFM.Matrix({ array: result.U });
            V = new SFM.Matrix({ array: result.V });
            D = new SFM.Matrix({ rows: this.rows, cols: this.cols });
            _.each(_.range(this.cols), function(i){
                D.set(i,i,result.S[i]);
            });
        }
        else {
            result = numeric.svd(this.getNativeCols());
            U = new SFM.Matrix({ array: result.V });
            V = new SFM.Matrix({ array: result.U });
            D = new SFM.Matrix({ rows: this.rows, cols: this.cols });
            _.each(_.range(this.rows), function(i){
                D.set(i,i,result.S[i]);
            });
        }
        return { U: U, D: D, V: V };
    },

    /**
     * @return {SFM.Matrix}
     */
    svdSolve: function(){
        return this.svd().V.getRow(this.cols-1).transpose();
    }

};

/**
 *
 * @param {number[][]} array
 * @return {SFM.Matrix}
 */
SFM.M = function(array){
    return new SFM.Matrix({ array: array });
};



/**
 * @return {SFM.Matrix}
 */
SFM.getIdentity = function(n){
    var m = new SFM.Matrix({ cols: n, rows: n });
    _.each(_.range(n), function(i){
        m.set(i,i,1);
    });
    return m;
};


/**
 *
 * @param {SFM.Matrix} m1
 * @param {SFM.Matrix} m2
 * @return {number}
 */
SFM.diffL2 = function(m1, m2){
   var row, col, diff=0;
    for (row=0; row<m1.rows; row++) {
        for (col=0; col<m1.cols; col++) {
            diff += Math.pow(m1.get(row, col)-m2.get(row, col), 2);
        }
    }
    return diff;
};