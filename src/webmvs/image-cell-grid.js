'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var cord = require('../utils/cord.js'),
    ImageCell = require('./image-cell.js'),
    settings = require('./settings.js');

//===========================================================

module.exports = ImageCellGrid;

//===========================================================


/**
 * Image cell grid class
 *
 * @param img
 * @param {int} beta - 2
 *
 * @property {CalibratedCamera} cam
 * @property {int} rows
 * @property {int} cols
 * @property {number} bound       - radius bound for feature matching
 * @property {int} beta           - cell size
 * @property {ImageCell[][]} grid - cell grid
 * @property img                  - image ndarray
 * @constructor
 */
function ImageCellGrid(img, beta){

    var _self = this,
        width = img.shape[0],
        height = img.shape[1],
        cam = { width: width, height: height },
        rows = Math.ceil(height/beta),
        cols = Math.ceil(width/beta),
        grid = _.range(rows).map(function(row){
            return _.range(cols).map(function(col){
                return new ImageCell(_self, row, col);
            });
        }),
        bound = settings.EPIPOLAR_LINE_RADIUS + Math.sqrt(2) * beta / 2;

    _.extend(this, {
        img: img,
        cam: cam,
        rows: rows,
        cols: cols,
        grid: grid,
        bound: bound
    });


}


/**
 * Distribute features into each cell
 * @param {Feature[]} features
 */
ImageCellGrid.prototype.registerFeatures = function(features){

    var beta = this.beta,
        grid = this.grid;

    features.forEach(function(f){

        var r = Math.floor(f.row/beta),
            c = Math.floor(f.col/beta),
            cell = grid[r][c],
            point = cord.feature2img(f);

        if (cell.features) {
            cell.features.push(point);
        }
        else {
            cell.features = [point];
        }

    });


};


/**
 * Remove all features in each cell (after match finished)
 */
ImageCellGrid.prototype.removeFeatures = function(){

    var grid = this.grid,
        r, c;

    for (r=0; r<this.rows; r++) {
        for (c=0; c<this.cols; c++) {
            delete grid[r][c].features;
        }
    }

};