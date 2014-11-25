'use strict';

var _ = require('underscore');

//======================================================


/**
 * @typedef {{cam: number, point: number}} View
 */


/**
 * @typedef {Object} Track - cam->feature
 */


/**
 * @typedef {{cam1: number, cam2: number, matches: number[][]}} TwoViewMatches
 */


//======================================================


/**
 * @param {TwoViewMatches[]} matchLists
 * @returns {{tracks:Track[], views: Object}}
 */
module.exports = function(matchLists) {

};