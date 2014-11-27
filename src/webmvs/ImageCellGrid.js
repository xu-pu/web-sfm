'use strict';

var _ = require('underscore');

var ImageCell = require('./ImageCell.js');


/**
 * Image cell grid class
 *
 * @param img
 * @param {Feature[]} features
 * @param {int} mu
 *
 *
 * @property {int} width
 * @property {int} height
 * @property {int} rows
 * @property {int} cols
 * @property {int} mu             - cell size
 * @property {ImageCell[][]} grid - cell grid
 * @property img                  - image ndarray
 * @constructor
 */
module.exports = function(img, features, mu){

    var _self = this,
        width = img.shape[0],
        height = img.shape[1],
        rows = Math.ceil(height/mu),
        cols = Math.ceil(width/mu),
        grid = _.range(rows).map(function(row){
            return _.range(cols).map(function(col){
                return new ImageCell(_self, row, col);
            });
        });

    _.extend(this, {
        mu: mu,
        img: img,
        width: width,
        height: height,
        rows: rows,
        cols: cols,
        grid: grid
    });

    features.forEach(function(f){

        var r = Math.floor(f.row/mu),
            c = Math.floor(f.col/mu),
            cell = grid[r][c];

        if (cell.features) {
            cell.features.push(f);
        }
        else {
            cell.features = [f];
        }

    });

};