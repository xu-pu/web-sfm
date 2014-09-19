'use strict';

var THREE = require('three');

module.exports = function(){
    var axisGeo = new THREE.Geometry();
    axisGeo.vertices = [
        new THREE.Vector3(0,0,0), new THREE.Vector3(500,0,0),
        new THREE.Vector3(0,0,0), new THREE.Vector3(0,500,0),
        new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,500)
    ];
    var axisMaterial = new THREE.LineBasicMaterial({
        color: 0x464646
    });
    return new THREE.Line(axisGeo, axisMaterial, THREE.LinePieces);
};