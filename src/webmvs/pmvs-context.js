'use strict';

module.exports = PMVSContext;


/**
 * @params {ImageCellGrid[]} images
 * @params {Patch[]} patches
 *
 * @property {ImageCellGrid[]} images
 * @property {Patch[]} patches
 *
 * @constructor
 */
function PMVSContext(images, patches){
    this.images = images;
    this.patches = patches;
}


/**
 * Register the patch, update related Q and Qstar
 * @param {Patch} p
 */
PMVSContext.prototype.addPatch = function(p){};


/**
 * Remove the patch, update related Q and Qstar
 * @param {Patch} p
 */
PMVSContext.prototype.removePatch = function(p){};