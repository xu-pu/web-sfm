'use strict';

var _ = require('underscore');

//==================================================

module.exports = Patch;

//==================================================


/**
 * Patch class
 *
 * @property {HomoPoint3D} c - patch center
 * @property {EulerAngles} n - normal vector
 * @property {ImageCellGrid}   R     - reference image
 * @property {ImageCellGrid[]} V     - visiable images
 * @property {ImageCellGrid[]} Vstar - visiable & photometric consistent images
 * @constructor
 */
function Patch(options){

    _.extend(this, options);

}