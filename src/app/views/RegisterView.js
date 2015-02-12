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

module.exports = Ember.View.extend({

    geometry: null,

    camera: null,

    scene: null,

    light: null,

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
        var control = new OrbitControls(camera);

        light.position.set(0, 300, 200);

        this.set('scene', scene);
        this.set('camera', camera);
        this.set('light', light);

        scene.add(light);
        scene.add(camera);

        var recovered = new THREE.Object3D();
        recovered.add(this.getCameras());
        recovered.add(this.getPointCloud());
        recovered.scale.set(SCALE, SCALE, SCALE);
        scene.add(recovered);

        camera.position.set(400,400,400);

        camera.lookAt(new V3(0,0,0));

        function render(){
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render();

    }.on('didInsertElement'),

    getPointCloud: function(){
        var pointsGeo = new THREE.Geometry();
        this.get('controller.points').forEach(function(p){
            pointsGeo.vertices.push(new THREE.Vector3(p.point[0], p.point[1], p.point[2]));
            pointsGeo.colors.push(new THREE.Color(p.color.R/255, p.color.G/255, p.color.B/255));
        });
        var pointsMaterial = new THREE.PointCloudMaterial({
            size: 3,
            vertexColors: true,
            blending: THREE.AdditiveBlending
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
        //camera.lookAt(array2glvector(focal.elements));
    }.observes('controller.focus')

});

function array2glvector(elements){
    return new THREE.Vector3(elements[0], elements[1], elements[2]);
}