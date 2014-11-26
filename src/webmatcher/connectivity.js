'use strict';

module.exports.ConnectivityGraph = ConnectivityGraph;
module.exports.ConnectivityNode = ConnectivityNode;

//========================================================
// Connectivity Graph
//========================================================


/**
 *
 * @param {TwoViewMatches[]} lists
 *
 * @property cams
 * @property {ConnectivityNode[]} nodes
 * @property {ConnectivityNode[][]} tracks
 *
 * @consturctor
 */
function ConnectivityGraph(lists){

    var _self = this;
    this.cams = {};
    this.nodes = [];
    this.tracks = [];

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


/**
 * Get node if exist, else null
 * @param {int} cam
 * @param {int} feature
 * @returns {undefined|ConnectivityNode}
 */
ConnectivityGraph.prototype.getNode = function(cam, feature){
    var node, camera = this.cams[cam];
    if (camera) {
        node = camera[feature];
    }
    return node;
};


/**
 * Create Node and return
 * @param {int} cam
 * @param {int} feature
 * @returns {ConnectivityNode}
 */
ConnectivityGraph.prototype.addNode = function(cam, feature){
    var node = new ConnectivityNode(cam, feature),
        camera = this.cams[cam];
    if (camera) {
        if (camera[feature]) {
            throw 'add node failed, node already exist!'
        }
    }
    else {
        this.cams[cam] = {};
        camera = this.cams[cam];
    }
    camera[feature] = node;
    this.nodes.push(node);
    return node;
};


/**
 * Get or create Node
 * @param {int} cam
 * @param {int} feature
 * @returns {ConnectivityNode}
 */
ConnectivityGraph.prototype.requireNode = function(cam, feature){
    var node = this.getNode(cam, feature);
    return node ? node : this.addNode(cam, feature);
};


/**
 * Convert Graph into tracks
 * @returns {ConnectivityNode[][]}
 */
ConnectivityGraph.prototype.toTracks = function(){

    while (this.nodes.length > 0) {
        this.tracks.push(
            this.track(this.nodes[0])
        );
    }

    return this.tracks;

};


/**
 * Destructive depth first traversal, removed from nodes after traversal
 * @returns {ConnectivityNode[]}
 */
ConnectivityGraph.prototype.track = function(start){

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