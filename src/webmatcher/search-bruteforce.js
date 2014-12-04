'use strict';

var _ = require('underscore');

var matching  = require('./feature-matching.js'),
    MinumumQueue = require('./minimum-queue.js');

//============================================================


/**
 * Bruteforce NN search for (f) in (features)
 * @param {Feature} f
 * @param {Feature[]} features
 * @returns {MinimumQueue}
 */
module.exports = function(f, features){

    var mins = new MinumumQueue(2);

    features.forEach(function(f2, index2){
        mins.checkMin(index2, matching.getFeatureDistance(f, f2));
    });

    return mins;

};