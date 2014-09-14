"use strict";

var THREE = require('three');

var Navigatable = require('../mixins/Navigatable.js');

module.exports = Ember.View.extend(Navigatable, {

    tagName: 'div',

    className: [
        'main-container__stereo-container'
    ],

    geometry: null,

    camera: null,

    scene: null,

    light: null,

    clock: null,

    isRotating: false,

    isMoving: false,

    anchor: null,

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
        var anchor = this.get('anchor'),
            camera = this.get('camera');
        if(this.get('isMoving')){
            camera.position.x = anchor.camX + e.pageX - anchor.x;
            camera.position.y = anchor.camY + e.pageY - anchor.y;
        }
        else if (this.get('isRotating')){
            camera.rotation.x = anchor.camX + Math.PI*(e.pageX - anchor.x)/2000;
            camera.rotation.y = anchor.camY + Math.PI*(e.pageY - anchor.y)/2000;
        }
    },

    wheel: function(e){
        var camera = this.get('camera');
        var ratio = e.wheelDelta > 0 ? 0.9 : 1.1;
        camera.position.x = ratio*camera.position.x;
        camera.position.y = ratio*camera.position.y;
        camera.position.z = ratio*camera.position.z;
    },

    didInsertElement: function(){
        var width = window.innerWidth,
            height = window.innerHeight;
        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0xe4e4e4, 1);
        renderer.setSize(width, height);
        this.$().append(renderer.domElement);

        var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10000);
        var scene = new THREE.Scene();
        var clock = new THREE.Clock();
        var light = new THREE.PointLight(0xffffff);

        this.set('scene', scene);
        this.set('camera', camera);
        this.set('light', light);
        this.set('clock', clock);

        scene.add(light);
        scene.add(camera);
        scene.add(this.getPointCloud());

        light.position.set(0, 300, 200);

        camera.position.x = 500;
        camera.position.y = 500;
        camera.position.z = 500;

        this.get('element').addEventListener('wheel', this.wheel.bind(this), false);

        function render(){
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render();

    },

    getPointCloud: function(){
        var SCALE = 100;
        var particlesGeometry = new THREE.Geometry();
        this.get('controller.pointcloud').forEach(function(point){
            particlesGeometry.vertices.push(new THREE.Vector3(point[0], point[1], point[2]));
//            particlesGeometry.colors.push(new THREE.Color(point.color.R/255, point.color.G/255, point.color.B/255));

        });
        var particlesMaterial = new THREE.PointCloudMaterial({
            color: 0x222222,
            size: 5
//            blending: THREE.AdditiveBlending,
//            transparent: true
        });
        var particlesSystem = new THREE.PointCloud(particlesGeometry, particlesMaterial);
        particlesSystem.scale.x = SCALE;
        particlesSystem.scale.y = SCALE;
        particlesSystem.scale.z = SCALE;
        particlesSystem.rotation.z = 5.0;
        return particlesSystem;
    }

});