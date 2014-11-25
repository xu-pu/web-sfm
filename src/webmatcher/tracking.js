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
    var tracks = [];
    var views = {};
    matchLists.forEach(function(matchlist){
        tracks = incrementalTracks(tracks, matchlist.cam1, matchlist.cam2, matchlist.matches);
        console.log('one incremental tracking finished, ' + tracks.length + 'tracks');
    });

    console.log('begin to filter tracks');
    tracks = filterTracks(tracks);

    console.log('begin to build view list');
    tracks.forEach(function(track, index){
        _.keys(track).forEach(function(view){
            if (view in views) {
                views[view].push(index);
            }
            else {
                views[view] = [index];
            }
        });
    });
    return { tracks: tracks, views: views };
};


/**
 *
 * @param {TwoViewMatches[]} lists
 * @consturctor
 */
function ConnectivityGraph(lists){

    var _self = this;

    lists.forEach(function(matches){
        var cam1 = matches.cam1,
            cam2 = matches.cam2;
        matches.matches.forEach(function(match){
            var i1 = match[0], i2 = match[1];
            var node1 = _self.requireNode(cam1, i1);
            var node2 = _self.requireNode(cam2, i2);
            node1.connect(node2);
        });
    });

}

ConnectivityGraph.prototype.getNode = function(cam, feature){};

ConnectivityGraph.prototype.addNode = function(cam, feature){};

ConnectivityGraph.prototype.requireNode = function(cam, feature){};

ConnectivityGraph.prototype.toTracks = function(){};


function ConnectivityNode(){
    this.connected = [];
}


ConnectivityNode.prototype.connect = function(node){

};


ConnectivityNode.prototype.disconnect = function(node){

};


/**
 *
 * @param {Track[]} tracks
 * @param {int} cam1
 * @param {int} cam2
 * @param {int[]} match
 */
function incrementalTracks(tracks, cam1, cam2, match){
    var matchedTracks = [];
    tracks.forEach(function(track, trackIndex){
        var matched1 = false,
            matched2 = false;
        track.forEach(function(view){
            if (view.cam === cam1 && view.point === match[0]) {
                matched1 = true;
            }
            else if (view.cam === cam2 && view.point === match[1]) {
                matched2 = true;
            }
        });
        if (matched1 || matched2) {
            if (!matched2) {
                track.push({ cam: cam2, point: match[1] });
            }
            if (!matched1) {
                track.push({ cam: cam1, point: match[0] });
            }
            matchedTracks.push(trackIndex);
        }
    });
    if (matchedTracks.length ===0) {
        tracks.push([
            { cam: cam1, point: match[0] },
            { cam: cam2, point: match[1] }
        ]);
    }
    else if (matchedTracks.length > 1) {
        var matched = [];
        matchedTracks.forEach(function(index){
            matched.push(tracks.splice(index, 1));
        });
        var combinedTrack = _.flatten(matched);
        tracks.push(combinedTrack);
    }
}


/**
 * @param {View[][]} tracks
 * @return {Track[]} tracks
 */
function filterTracks(tracks){
    var result = [];
    tracks.forEach(function(track){
        var views = {};
        var consistent = track.every(function(view){
            if (view.cam in views) {
                if (views[view.cam] !== view.point) {
                    return false;
                }
            }
            else {
                views[view.cam] = view.point;
            }
            return true;
        });
        if (consistent) {
            result.push(views);
        }
    });
    return result;
}