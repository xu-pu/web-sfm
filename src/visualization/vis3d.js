'use strict';

var THREE = require('three'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


/**
 * @param {CalibratedCamera} camera
 * @returns {THREE.Line}
 */
exports.getCameraFrame = function(camera){

    var R = camera.R,
        t = camera.t,
        focal = camera.focal,
        imgHeight = camera.cam.height,
        imgWidth = camera.cam.width;

    var camMaterial = new THREE.LineBasicMaterial({
        color: 0xFF0000
    });

    var Ri = R.transpose(),
        T = Ri.x(t).x(-1),
        ratio = focal*2,
        camWidth = imgWidth/ratio,
        camHeight = imgHeight/ratio,
        corner1 = Ri.x(Vector.create([camWidth/2, camHeight/2, 1]).subtract(t)),
        corner2 = Ri.x(Vector.create([camWidth/2, -camHeight/2, 1]).subtract(t)),
        corner3 = Ri.x(Vector.create([-camWidth/2, -camHeight/2, 1]).subtract(t)),
        corner4 = Ri.x(Vector.create([-camWidth/2, camHeight/2, 1]).subtract(t));

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