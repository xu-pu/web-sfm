'use strict';

App.StereoView = Ember.View.extend({

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

    mouseDown: function(e){
        e.preventDefault();
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

    contextMenu: function(){ return false; },

    mouseUp: function(){
        this.set('isRotating', false);
        this.set('isMoving', false);
    },

    mouseMove: function(e){
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
        var width = $(document.body).width(),
            height = $(document.body).height();
        var renderer = new THREE.WebGLRenderer();
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

        light.position.set(0, 300, 200);

        camera.position.x = 1000;
        camera.position.y = 1000;
        camera.position.z = 1000;

        function render(){
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render();

        $.getJSON('/dataset/mvs/option.txt.pset.json')
            .then(_.bind(this.afterLoaded, this));
    },

    afterLoaded: function(data){
        var particlesGeometry = new THREE.Geometry();
        data.forEach(function(point){
            particlesGeometry.vertices.push(new THREE.Vector3(point[0]*100, point[1]*100, point[2]*100));
        }, this);
        var particlesMaterial = new THREE.ParticleSystemMaterial({
            color: 0xFFFFFF,
            size: 5,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        var particlesSystem = new THREE.ParticleSystem(particlesGeometry, particlesMaterial);

        this.set('geometry', particlesGeometry);
        this.set('structure', particlesSystem);

        particlesSystem.rotation.z = 5.0;

        this.get('scene').add(particlesSystem);
    }
});