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
        var scene = new THREE.Scene();
        var light = new THREE.PointLight(0xffffff);
        var control = new OrbitControls(camera, renderer.domElement);

        scene.add(light);
        scene.add(camera);
        scene.add(this.getPointCloud());

        light.position.set(0, 300, 200);

        camera.position.x = 500;
        camera.position.y = 500;
        camera.position.z = 500;

        control.addEventListener('change', function(){
            renderer.render(scene, camera);
        });

        renderer.render(scene, camera);

    }.on('didInsertElement'),

    getPointCloud: function(){

        var size = this.get('surfels.size'),
            points = this.get('surfels.points'),
            colors = this.get('surfels.colors');

        var SCALE = 40;
        var surfelsGeometry = new THREE.Geometry();

        var cursor;
        for (cursor=0; cursor<size; cursor++) {
            surfelsGeometry.vertices.push(new THREE.Vector3(
                points.get(cursor, 0),
                points.get(cursor, 1),
                points.get(cursor, 2)
            ));
            surfelsGeometry.colors.push(new THREE.Color(
                colors.get(cursor, 0) / 255,
                colors.get(cursor, 1) / 255,
                colors.get(cursor, 2) / 255
            ));
        }

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