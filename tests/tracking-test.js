'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var connectivity = require('../src/webmatcher/tracking.js'),
    ConnectivityGraph = tracking.ConnectivityGraph,
    samples = require('../src/utils/samples.js'),
    genRamdom = require('../src/utils/random.js'),
    laUtils = require('../src/math/la-utils.js');


function testTrack(){

    var dataset = [
        [2,3],
        [2,4],
        [3,4],
        [3,5],
        [4,5],
        [5,6],
        [6,7],
        [7,8]
    ].map(
        function(pair){
            var cam1 = pair[0], cam2 = pair[1];
            return {
                cam1: cam1,
                cam2: cam2,
                matches: samples.getRawMatches(cam1, cam2)
            };
        }
    );

    var graph = new ConnectivityGraph(dataset);
    var tracks = graph.getTracks();

    console.log();

}

testTrack();