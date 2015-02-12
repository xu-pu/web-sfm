"use strict";

var THREE = require('three'),
    OrbitControls = require('three-orbit-controls')(THREE);

module.exports = Ember.View.extend({

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
        var control = new OrbitControls(camera);

        this.set('scene', scene);
        this.set('camera', camera);
        this.set('light', light);

        scene.add(light);
        scene.add(camera);
        scene.add(this.getPointCloud());

        light.position.set(0, 300, 200);

        camera.position.x = 500;
        camera.position.y = 500;
        camera.position.z = 500;

        function render(){
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render();

    }.on('didInsertElement'),

    getPointCloud: function(){
        var SCALE = 40;
        var surfelsGeometry = new THREE.Geometry();
        this.get('controller.pointcloud').forEach(function(patch){
            var point = patch.point,
                color = patch.color;
            surfelsGeometry.vertices.push(new THREE.Vector3(point[0], point[1], point[2]));
            surfelsGeometry.colors.push(new THREE.Color(color.R/255, color.G/255, color.B/255));
        });
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