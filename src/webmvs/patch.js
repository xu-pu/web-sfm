'use strict';

var _ = require('underscore');

//==================================================

module.exports = Patch;

//==================================================


/**
 * Patch class
 *
 * @property {Vector} c - patch center in-homogeneous
 * @property {Vector} n - normal in-homogeneous
 * @property {ImageCellGrid}   R     - reference image
 * @property {ImageCellGrid[]} V     - visiable images
 * @property {ImageCellGrid[]} Vstar - visiable & photometric consistent images
 * @constructor
 */
function Patch(options){

    _.extend(this, options);

}