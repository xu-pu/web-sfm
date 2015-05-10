"use strict";

var THREE = require('three'),
    OrbitControls = require('three-orbit-controls')(THREE);

module.exports = Ember.Component.extend({

    tagName: 'div',

    className: [
        'main-container__stereo-container'
    ],

    geometry: null,

    camera: null,

    scene: null,

    light: null,

    prepareRendering: function(){

        var width = window.innerWidth,
            height = window.innerHeight;
        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0xe4e4e4, 1);
        renderer.setSize(width, height);
        this.get('element').appendChild(renderer.domElement);

        var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10000);
        camera.position.x = 500;
        camera.position.y = 500;
        camera.position.z = 500;

        var scene = new THREE.Scene();

        var light = new THREE.PointLight(0xffffff);
        light.position.set(0, 300, 200);

        var control = new OrbitControls(camera, renderer.domElement);

        scene.add(light);
        scene.add(camera);
        scene.add(this.getPointCloud());

        control.addEventListener('change', function(){
            renderer.render(scene, camera);
        });

        renderer.render(scene, camera);

    }.on('didInsertElement'),

    getPointCloud: function(){

        var points = this.get('surfels.points'),
            colors = this.get('surfels.colors');

        var bufferSize = colors.length;
        var colorBuffer = new Float32Array(bufferSize);
        for(var i=0; i<bufferSize; i++) {
            colorBuffer[i] = colors[i]/255;
        }

        var SCALE = 40;
        var surfelsGeometry = new THREE.BufferGeometry();

        surfelsGeometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
        surfelsGeometry.addAttribute('color', new THREE.BufferAttribute(colorBuffer, 3));

        var surfelsMaterial = new THREE.PointCloudMaterial({
            vertexColors: true,
            size: 4,
            blending: THREE.AdditiveBlending
        });
        var surfels = new THREE.PointCloud(surfelsGeometry, surfelsMaterial);
        surfels.scale.set(SCALE, SCALE, SCALE);
        surfels.rotation.z = 5.0;
        return surfels;
    }

});