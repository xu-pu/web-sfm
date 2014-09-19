"use strict";

var _ = require('underscore'),
    la = require('sylvester'),
    THREE = require('three'),
    V3 = THREE.Vector3,
    Matrix = la.Matrix,
    Vector = la.Vector;

var Navigatable = require('../mixins/Navigatable.js');

var getCordFrame = require('../../visualization/getCoordinateFrame.js'),
    getBundlerCamera = require('../../visualization/getBundlerCamera.js');

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
        renderer.setClearColor(0xe4e4e4, 1);
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
        scene.add(getCordFrame());

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

        camera.lookAt(new V3(0,0,0));

        this.get('element').addEventListener('wheel', this.wheel.bind(this), false);

        function render(){
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render();
    },

    getPointCloud: function(){
        var pointsGeo = new THREE.Geometry();
        this.get('controller.points').forEach(function(p){
            pointsGeo.vertices.push(new THREE.Vector3(p.point[0], p.point[1], p.point[2]));
            pointsGeo.colors.push(new THREE.Color(p.color.R/255, p.color.G/255, p.color.B/255));
        });

        var pointsMaterial = new THREE.PointCloudMaterial({
//            color: 0x222222,
            size: 3,
            vertexColors: true
//            blending: THREE.AdditiveBlending,
//            transparent: true
        });

        return new THREE.PointCloud(pointsGeo, pointsMaterial);
    },

    getCameras: function(){
        var cameras = new THREE.Object3D();
        this.get('controller.cameras').forEach(function(cam){
            cameras.add(getBundlerCamera(cam));
        });
        return cameras;
    },

    onFocus: function(){
        var cam = this.get('controller.focus'),
            camera = this.get('camera');
        var R = Matrix.create(cam.R),
            Ri = R.inverse(),
            t = Vector.create(cam.t),
            T = Ri.x(t).x(-1),
            focal = Ri.x(Vector.create([0,0,-1]).subtract(t));
        camera.position.set(T.elements[0], T.elements[1], T.elements[2]);
        camera.lookAt(array2glvector(focal.elements));
    }.observes('controller.focus')


});

function array2glvector(elements){
    return new THREE.Vector3(elements[0], elements[1], elements[2]);
}