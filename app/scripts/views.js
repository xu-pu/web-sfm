'use strict';

App.ImageLoaderView = Ember.View.extend({

    isActive: false,

    tagName: 'div',

    classNames: [
        'main-container__input-gallery__item',
        'main-container__input-gallery__input'
    ],

    dragOver: function(e){
        e.preventDefault();
    },

    dragEnter: function(e){
        e.preventDefault();
        this.isActive = true;
    },

    dragLeave: function(e){
        e.preventDefault();
        this.isActive = false;
    },

    drop: function(e){
        e.preventDefault();
        var files = e.dataTransfer.files;
        for (var i=0; i<files.length; i++) {
            App.Data.images.addObject(App.Image.create({ file: files[i] }));
        }
    }

});


App.MvsView = Ember.View.extend({

    geometry: null,

    init: function(){
        var width = window.innerWidth,
            height = window.innerHeight;
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
    },

    afterLoaded: function(data){
        var particlesGeometry = new THREE.Geometry();
        var particlesMaterial = new THREE.ParticleSystemMaterial({
            color: 0xFFFFFF,
            size: 5,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        var particlesSystem = new THREE.ParticleSystem(particlesGeometry, particlesMaterial);
        this.set('geometry', particlesGeometry);
        particlesSystem.rotation.z = 5.0;
        data.forEach(function(point){
            this.get('geometry').vertices.push(new THREE.Vector3(point[0]*100, point[1]*100, point[2]*100));
        }, this);
        scene.add(particlesSystem);
    }

});