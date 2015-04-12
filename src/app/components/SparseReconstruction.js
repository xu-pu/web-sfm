"use strict";

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    THREE = require('three'),
    OrbitControls = require('three-orbit-controls')(THREE),
    V3 = THREE.Vector3;

var getBundlerCamera = require('../../visualization/getBundlerCamera.js'),
    cord = require('../../utils/cord.js');

module.exports = Ember.Component.extend({

    geometry: null,

    camera: null,

    scene: null,

    prepareRendering: function(){

        var width = window.innerWidth,
            height = window.innerHeight,
            SCALE = 20;
        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0xe4e4e4, 1);
        renderer.setSize(width, height);
        this.get('element').appendChild(renderer.domElement);

        var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10000);
        var scene = new THREE.Scene();
        var light = new THREE.PointLight(0xffffff);
        var control = new OrbitControls(camera, renderer.domElement);

        light.position.set(0, 300, 200);

        this.set('scene', scene);
        this.set('camera', camera);

        scene.add(light);
        scene.add(camera);

        var recovered = new THREE.Object3D();
        recovered.add(this.getCameras());
        recovered.add(this.getPointCloud());
        recovered.scale.set(SCALE, SCALE, SCALE);
        scene.add(recovered);

        camera.position.set(400,400,400);

        camera.lookAt(new V3(0,0,0));

        control.addEventListener('change', function(){
            renderer.render(scene, camera);
        });

        renderer.render(scene, camera);

    }.on('didInsertElement'),

    getPointCloud: function(){

        var points = this.get('sparse.points'),
            colors = this.get('sparse.colors');

        var bufferSize = colors.length;
        var colorBuffer = new Float32Array(bufferSize);
        for(var i=0; i<bufferSize; i++) {
            colorBuffer[i] = colors[i]/255;
        }

        var surfelsGeometry = new THREE.BufferGeometry();
        surfelsGeometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
        surfelsGeometry.addAttribute('color', new THREE.BufferAttribute(colorBuffer, 3));

        var pointsMaterial = new THREE.PointCloudMaterial({
            size: 3,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });

        return new THREE.PointCloud(surfelsGeometry, pointsMaterial);

    },

    getCameras: function(){
        var cameras = new THREE.Object3D();
        this.get('cameras').forEach(function(cam){
            cameras.add(getBundlerCamera(cam));
        });
        return cameras;
    }

});