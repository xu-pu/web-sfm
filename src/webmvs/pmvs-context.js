'use strict';

module.exports = PMVSContext;


/**
 * @param {ImageCellGrid[]} images
 * @param {Patch[]} patches
 * @param {int} beta1
 * @param {int} beta2
 * @param {int} mu
 *
 * @property {ImageCellGrid[]} images
 * @property {Patch[]} patches
 * @property {int} beta1
 * @property {int} beta2
 * @property {int} mu
 *
 * @constructor
 */
function PMVSContext(images, patches, beta1, beta2, mu){
    this.images = images;
    this.patches = patches;
    this.beta1 = beta1;
    this.beta2 = beta2;
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