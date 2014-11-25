'use strict';

var _ = require('underscore');


/**
 * Patch class
 *
 * @property c - patch center
 * @property n - normal vector
 * @property R - reference image
 * @property V - visiable images
 * @constructor
 */
module.exports = function(options){

    _.extend(this, options);

};