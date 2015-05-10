'use strict';

module.exports = PMVSContext;


/**
 * @param {ImageCellGrid[]} images
 * @param {Patch[]} patches
 * @param {int} beta
 * @param {int} mu
 *
 * @property {ImageCellGrid[]} images
 * @property {Patch[]} patches
 * @property {int} beta - cell size
 * @property {int} mu - patch size
 *
 * @constructor
 */
function PMVSContext(images, patches, beta, mu){
    this.images = images;
    this.patches = patches;
    this.beta = beta;
    this.mu = mu;
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