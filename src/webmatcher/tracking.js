'use strict';

var _ = require('underscore');

//========================================================

exports.ConnectivityGraph = ConnectivityGraph;
exports.ConnectivityNode = ConnectivityNode;
exports.VisibilityGraph = VisibilityGraph;

/**
 * @param {TwoViewMatches[]} matchTable
 * @param pointTable
 * @returns Track[]
 */
exports.track = function(matchTable, pointTable) {

    var graph = new ConnectivityGraph(matchTable),
        nodeTracks = graph.getTracks(),
        tracks = [];

    nodeTracks.forEach(function(nodes){

        var camSet = [];

        // Enforce unique feature for each cam
        var trackValid = nodes.every(function(node){
            if (camSet.indexOf(node.cam) === -1) {
                camSet.push(node.cam);
                return true;
            }
            else {
                return false;
            }
        });

        if (trackValid) {
            tracks.push(nodes.map(function(n){
                var cam= n.cam,
                    feature = n.feature;
                return {
                    cam: cam,
                    point: {
                        row: pointTable[cam].get(feature, 0),
                        col: pointTable[cam].get(feature, 1)
                    }
                };
            }));
        }

    });

    return tracks;

};

//========================================================
// Track Filters
//========================================================

/**
 *
 * @param {Track[]} tracks
 * @param {int} i
 * @returns {Track[]}
 */
exports.viewedBy1 = function(tracks, i){
    return tracks.filter(function(track){
        return track.some(function(view){
            return view.cam === i;
        });
    });
};


/**
 *
 * @param {Track[]} tracks
 * @param {int[]} cams
 * @returns Track[]
 */
exports.viewedByN = function(tracks, cams){
    return tracks.filter(function(track){
        return cams.every(function(i){
            return track.some(function(view){
                return view.cam === i;
            });
        });
    });
};

//========================================================
// Visibility Graph
//========================================================

/**
 *
 * @param {Track[]} tracks
 *
 * @property {Track[]} tracks
 * @property cams
 *
 * @constructor
 */
function VisibilityGraph(tracks){
    this.tracks = tracks;
    var cams = this.cams = {};
    tracks.forEach(function(track, trackIndex){
        track.forEach(function(view){
            var cam = view.cam;
            var visiables = cams[cam] = (cams[cam] || []);
            visiables.push(trackIndex);
        });
    });
}


//========================================================
// Connectivity Graph
//========================================================


/**
 * @param {TwoViewMatches[]} lists
 * @property nodes
 * @consturctor
 */
function ConnectivityGraph(lists){

    var _self = this;
    this.nodes = {};

    lists.forEach(function(entry){
        var cam1 = entry.from,
            cam2 = entry.to;
        entry.matches.forEach(function(match){
            var i1 = match[0], i2 = match[1];
            var node1 = _self.requireNode(cam1, i1);
            var node2 = _self.requireNode(cam2, i2);
            node1.connect(node2);
        });
    });

}


/**
 * Get or create Node
 * @param {int} cam
 * @param {int} feature
 * @returns {ConnectivityNode}
 */
ConnectivityGraph.prototype.requireNode = function(cam, feature){

    var nodes = this.nodes,
        node = nodes[[cam, feature]];

    if (node) {
        return node;
    }
    else {
        node = new ConnectivityNode(cam, feature);
        nodes[[cam, feature]] = node;
        return node;
    }

};


/**
 * Convert Graph into tracks
 * @returns {ConnectivityNode[][]}
 */
ConnectivityGraph.prototype.getTracks = function(){

    var nodes = _.values(this.nodes),
        tracks = [], seed, track;

    while (nodes.length > 0) {
        seed = nodes[0];
        track = this.traverseNode(seed);
        tracks.push(track);
        nodes = _.difference(nodes, track);
    }

    return tracks;

};


/**
 * @param {ConnectivityNode} source
 * @returns {ConnectivityNode[]}
 */
ConnectivityGraph.prototype.traverseNode = function(source){

    var traversed = [source], cursor = 0;

    while (cursor < traversed.length) {
        traversed[cursor].connected.forEach(function(node){
            if (traversed.indexOf(node) === -1) {
                traversed.push(node);
            }
        });
        cursor++;
    }

    return traversed;

};


//========================================================
// Connectivity Node
//========================================================


/**
 * Node
 * @property {int} cam
 * @property {int} feature
 * @constructor
 */
function ConnectivityNode(cam, feature){
    this.cam = cam;
    this.feature = feature;
    this.connected = [];
}


/**
 * Connect tow nodes
 * @param {ConnectivityNode} node
 */
ConnectivityNode.prototype.connect = function(node){
    if (this.connected.indexOf(node) === -1) {
        this.connected.push(node);
    }
    if (node.connected.indexOf(this) === -1) {
        node.connected.push(this);
    }
};


/**
 * Disconnect two nodes
 * @param {ConnectivityNode} node
 */
ConnectivityNode.prototype.disconnect = function(node){
    var outro = this.connected.indexOf(node),
        intro = node.connected.indexOf(this);
    if (intro != -1) {
        node.connected.splice(intro, 1);
    }
    if (outro != -1) {
        this.connected.splice(outro, 1);
    }
};