'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var MVS_SETTINGS = require('./settings.js'),
    cord = require('../utils/cord.js'),
    geoUtils = require('../math/geometry-utils.js');

//==========================================================

module.exports = ImageCell;

//==========================================================


/**
 * Image cell class
 *
 * @property {Feature[]} features
 * @property {ImageCellGrid} grid
 * @property {int} row
 * @property {int} col
 * @property {Patch[]} Q     - reverse reference of Patch.V
 * @property {Patch[]} Qstar - reverse reference of Patch.Vstar
 * @constructor
 */
function ImageCell(grid, row, col){

    _.extend(this, {
        grid: grid,
        row: row,
        col: col
    });

}


/**
 * Search for features match the epipolar line in the cell
 * @param line
 * @returns {Boolean|[]}
 */
ImageCell.prototype.searchEpipolarLine = function(line){

    var BOUND = MVS_SETTINGS.EPIPOLAR_LINE_RADIUS;

    if (!this.features) {
        // features removed from cell
        return false;
    }

    var mu = this.grid.mu,
        center = Vector.create(cord.RCtoImg(mu*this.row+mu/2, mu*this.col+mu/2, this.grid.cam));

    if (geoUtils.getPoint2Line(center, line) > this.grid.bound) {
        // out of radius
        return false;
    }

    var selected = this.features.filter(function(point){
        return geoUtils.getPoint2Line(point, line) <= BOUND;
    });

    if (selected.length === 0) {
        // no feature matched the epipolar line
        return false;
    }
    else {
        return selected;
    }

};