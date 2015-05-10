'use strict';

var THREE = require('three'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var laUtils = require('../math/la-utils.js');

/**
 *
 * @returns {THREE.Line}
 */
exports.getCoordinateFrame = function(){
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


/**
 * @param {CalibratedCamera} camera
 * @returns {THREE.Line}
 */
exports.getCameraFrame = function(camera){

    var R = camera.R,
        t = camera.t,
        focal = camera.focal,
        height = camera.cam.height,
        width = camera.cam.width,
        px = camera.px,
        py = camera.py;

    var camMaterial = new THREE.LineBasicMaterial({
        color: 0xFF0000
    });

    var Ri = R.transpose(),
        T = Ri.x(t).x(-1),
        ratio = 1/focal,
        offset = laUtils.toVector([px, py, 0]),
        c1 = laUtils.toVector([ width, height, focal]).subtract(offset).x(ratio),
        c2 = laUtils.toVector([ width, 0     , focal]).subtract(offset).x(ratio),
        c3 = laUtils.toVector([ 0    , 0     , focal]).subtract(offset).x(ratio),
        c4 = laUtils.toVector([ 0    , height, focal]).subtract(offset).x(ratio),
        corner1 = Ri.x(c1.subtract(t)),
        corner2 = Ri.x(c2.subtract(t)),
        corner3 = Ri.x(c3.subtract(t)),
        corner4 = Ri.x(c4.subtract(t));

    var camPosition = array2glvector(T.elements),
        corner1Position = array2glvector(corner1.elements),
        corner2Position = array2glvector(corner2.elements),
        corner3Position = array2glvector(corner3.elements),
        corner4Position = array2glvector(corner4.elements);

    var camerasGeo = new THREE.Geometry();

    camerasGeo.vertices = [
        camPosition, corner1Position,
        camPosition, corner2Position,
        camPosition, corner3Position,
        camPosition, corner4Position,

        corner1Position, corner2Position,
        corner2Position, corner3Position,
        corner3Position, corner4Position,
        corner4Position, corner1Position
    ];

    return new THREE.Line(camerasGeo, camMaterial, THREE.LinePieces);

};


function array2glvector(elements){
    return new THREE.Vector3(elements[0], elements[1], elements[2]);
}