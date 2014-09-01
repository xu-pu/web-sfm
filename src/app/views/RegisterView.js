"use strict";

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

        [this.getCameras(), this.getPointCloud()].forEach(function(system){
            system.scale.x = SCALE;
            system.scale.y = SCALE;
            system.scale.z = SCALE;
            scene.add(system);
        });

        camera.position.x = 400;
        camera.position.y = 400;
        camera.position.z = 400;

        //camera.lookAt(axisSystem.position);

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
        return new THREE.Line(axisGeo, axisMaterial, THREE.Lines);
    },

    getPointCloud: function(){
        var pointsGeo = new THREE.Geometry();
        this.get('controller.points').forEach(function(p){
            pointsGeo.vertices.push(new THREE.Vector3(p.point[0], p.point[1], p.point[2]));
        });
        var pointsMaterial = new THREE.PointCloudMaterial({
            color: 0xFFFFFF,
            size: 3,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        return new THREE.PointCloud(pointsGeo, pointsMaterial);
    },

    getCameras: function(){
        var camerasGeo = new THREE.Geometry();
        this.get('controller.cameras').forEach(function(cam){
            camerasGeo.vertices.push(new THREE.Vector3(cam.t[0], cam.t[1], cam.t[2]));
        });
        var particlesMaterial = new THREE.PointCloudMaterial({
            color: 0xFF0000,
            size: 5,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        return new THREE.PointCloud(camerasGeo, particlesMaterial);
    },

    afterLoaded: function(data){

        var scene = this.get('scene');

        //=============================
        // Views
        //=============================
        var viewList = bundlerViewList(data);
        var viewGeo = new THREE.Geometry();
        [20].forEach(function(camera){
            var cam = data.cameras[camera];
            (viewList[camera]||[]).forEach(function(point){
                var p = data.points[point];
                viewGeo.vertices.push(new THREE.Vector3(p.point[0], p.point[1], p.point[2]));
                viewGeo.vertices.push(new THREE.Vector3(cam.t[0], cam.t[1], cam.t[2]));
            });
        });
        var viewMaterial = new THREE.LineBasicMaterial({
            color: 0xFFFFFF
        });
        var viewSystem = new THREE.Line(viewGeo, viewMaterial, THREE.Lines);

        this.set('view', viewGeo);
        this.set('viewList', viewList);
        this.set('currentView', 20);
    },

    nextView: function(){
        var viewGeo = this.get('view');
        var viewList = this.get('viewList');
        var camera = this.get('currentView');
        camera++;
        this.set('currentView', camera);
        var data = this.get('data');
        var cam = data.cameras[camera];

        (viewList[camera]||[]).forEach(function(point){
            var p = data.points[point];
            viewGeo.vertices = [];
            viewGeo.vertices.push(new THREE.Vector3(p.point[0], p.point[1], p.point[2]));
            viewGeo.vertices.push(new THREE.Vector3(cam.t[0], cam.t[1], cam.t[2]));
        });

    }

});