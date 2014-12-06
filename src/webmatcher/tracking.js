'use strict';

var _ = require('underscore');

//======================================================

var connectivity = require('./connectivity.js'),
    ConnectivityGraph = connectivity.ConnectivityGraph;

//======================================================


/**
 * @typedef {{ cam: number, point: number }} TrackView
 */


/**
 * @typedef {TrackView[]} Track
 */


/**
 * @typedef {{ cam1: number, cam2: number, matches: number[][] }} TwoViewMatches
 */


//======================================================


/**
 * @param {TwoViewMatches[]} dataset
 * @returns {{ tracks:Track[], views: Track[][] }} - views[cam]=>Track[]
 */
module.exports = function(dataset) {

    var graph = new ConnectivityGraph(dataset),
        closures = graph.getTracks(),
        tracks = [],
        views = [];

    closures.forEach(function(nodes){

        var cams = [], track = [];

        var trackValid = nodes.every(function(node){
            if (cams.indexOf(node.cam) === -1) {
                cams.push(node.cam);
                track.push({ cam: node.cam, point: node.feature });
                return true;
            }
            else {
                return false;
            }
        });

        if (trackValid) {
            tracks.push(track);
            cams.forEach(function(cam){
                var view = views[cam];
                if (view) {
                    view.push(track);
                }
                else {
                    views[cam] = [track];
                }
            });
        }

    });

    return { tracks: tracks, views: views };

};