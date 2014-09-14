"use strict";

var _ = require('underscore'),
    la = require('sylvester'),
    THREE = require('three'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var Navigatable = require('../mixins/Navigatable.js');

module.exports = Ember.View.extend(Navigatable, {

    geometry: null,

    camera: null,

    scene: null,

    light: null,

    clock: null,

    isRotating: false,

    isMoving: false,

    anchor: null,

    wheel: function(e){
        var camera = this.get('camera');
        var ratio = e.wheelDelta > 0 ? 0.9 : 1.1;
        camera.position.x = ratio*camera.position.x;
        camera.position.y = ratio*camera.position.y;
        camera.position.z = ratio*camera.position.z;
    },

    beginNavigation: function(e){
        var camera = this.get('camera');
        if (camera){
            switch (e.which){
                case 1: // left key
                    this.set('anchor', {
                        x: e.pageX,
                        y: e.pageY,
                        camX: camera.position.x,
                        camY: camera.position.y
                    });
                    this.set('isMoving', true);
                    break;
                case 3: // right key
                    this.set('anchor', {
                        x: e.pageX,
                        y: e.pageY,
                        camX: camera.rotation.x,
                        camY: camera.rotation.y
                    });
                    this.set('isRotating', true);
                    break;
                default:
                    break;
            }
        }
    },

    releaseNavigation: function(){
        this.set('isRotating', false);
        this.set('isMoving', false);
    },

    navigate: function(e){
        var anchor, camera;
        if(this.get('isMoving')){
            anchor = this.get('anchor');
            camera = this.get('camera');
            camera.position.x = anchor.camX + e.pageX - anchor.x;
            camera.position.y = anchor.camY + e.pageY - anchor.y;
        }
        else if (this.get('isRotating')){
            anchor = this.get('anchor');
            camera = this.get('camera');
            camera.rotation.x = anchor.camX + Math.PI*(e.pageX - anchor.x)/2000;
            camera.rotation.y = anchor.camY + Math.PI*(e.pageY - anchor.y)/2000;
        }
    },

    didInsertElement: function(){
        var width = window.innerWidth,
            height = window.innerHeight,
            SCALE = 20;
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        this.$().append(renderer.domElement);

        var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10000);
        var scene = new THREE.Scene();
        var clock = new THREE.Clock();
        var light = new THREE.PointLight(0xffffff);

        light.position.set(0, 300, 200);

        this.set('scene', scene);
        this.set('camera', camera);
        this.set('light', light);
        this.set('clock', clock);

        scene.add(light);
        scene.add(camera);
        scene.add(this.getCordFrame());

        var recovered = new THREE.Object3D();
        recovered.add(this.getCameras());
        recovered.add(this.getPointCloud());
        recovered.scale.x = SCALE;
        recovered.scale.y = SCALE;
        recovered.scale.z = SCALE;
        scene.add(recovered);

        camera.position.x = 400;
        camera.position.y = 400;
        camera.position.z = 400;

        this.get('element').addEventListener('wheel', this.wheel.bind(this), false);

        function render(){
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render();
    },

    getCordFrame: function(){
        var axisGeo = new THREE.Geometry();
        axisGeo.vertices.push(new THREE.Vector3(0,0,0));
        axisGeo.vertices.push(new THREE.Vector3(1000,0,0));
        axisGeo.vertices.push(new THREE.Vector3(0,0,0));
        axisGeo.vertices.push(new THREE.Vector3(0,1000,0));
        axisGeo.vertices.push(new THREE.Vector3(0,0,0));
        axisGeo.vertices.push(new THREE.Vector3(0,0,1000));
        var axisMaterial = new THREE.LineBasicMaterial({
            color: 0xFFFFFF
        });
        return new THREE.Line(axisGeo, axisMaterial, THREE.LinePieces);
    },

    getPointCloud: function(){
        var pointsGeo = new THREE.Geometry();
        this.get('controller.points').forEach(function(p){
            pointsGeo.vertices.push(new THREE.Vector3(p.point[0], p.point[1], p.point[2]));
//            pointsGeo.colors.push(new THREE.Color(p.color.R/255, p.color.G/255, p.color.B/255));
        });

        var pointsMaterial = new THREE.PointCloudMaterial({
            color: 0xFFFFFF,
            size: 3
//            blending: THREE.AdditiveBlending,
//            transparent: true
        });

        return new THREE.PointCloud(pointsGeo, pointsMaterial);
    },

    getCameras: function(){
        var imgWidth=3000, imgHeight=2000,
            cameras = new THREE.Object3D(),
            lineMaterial = new THREE.LineBasicMaterial({
                color: 0xFF0000
            });

        this.get('controller.cameras').forEach(function(cam){

            var R = Matrix.create(cam.R),
                Ri = R.inverse(),
                t = Vector.create(cam.t),
                T = Ri.x(t).x(-1),
                ratio = cam.focal* 2,
                camWidth = imgWidth/ratio,
                camHeight = imgHeight/ratio,
                corner1 = Ri.x(Vector.create([camWidth/2, camHeight/2, -1]).subtract(t)),
                corner2 = Ri.x(Vector.create([camWidth/2, -camHeight/2, -1]).subtract(t)),
                corner3 = Ri.x(Vector.create([-camWidth/2, -camHeight/2, -1]).subtract(t)),
                corner4 = Ri.x(Vector.create([-camWidth/2, camHeight/2, -1]).subtract(t));

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

            cameras.add(new THREE.Line(camerasGeo, lineMaterial, THREE.LinePieces));

        });

        /*
        var particlesMaterial = new THREE.PointCloudMaterial({
            color: 0xFF0000,
            size: 5,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        return new THREE.PointCloud(camerasGeo, particlesMaterial);
        */

        return cameras;

    }

});

function array2glvector(elements){
    return new THREE.Vector3(elements[0], elements[1], elements[2]);
}