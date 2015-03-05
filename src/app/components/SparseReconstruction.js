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

        var size = this.get('sparse.size'),
            points = this.get('sparse.points'),
            colors = this.get('sparse.colors');

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
    },

    onFocus: function(){
        var cam = this.get('controller.focus'),
            camera = this.get('camera');
        var Rt = cord.getStandardRt(Matrix.create(cam.R), Vector.create(cam.t)),
            R = Rt.R,
            t = Rt.t,
            Ri = R.transpose(),
            T = Ri.x(t).x(-1),
            focal = Ri.x(Vector.create([0,0,1]).subtract(t));
        camera.position.set(T.elements[0], T.elements[1], T.elements[2]);

        R = Matrix.create(cam.R).transpose();

        var rot = new THREE.Matrix4(
            R.e(1,1), R.e(1,2), R.e(1,3), 0,
            R.e(2,1), R.e(2,2), R.e(2,3), 0,
            R.e(3,1), R.e(3,2), R.e(3,3), 0,
            0       , 0       , 0       , 1
        );

        camera.rotation.setFromRotationMatrix(rot, 'XYZ');

    }.observes('controller.focus')

});