"use strict";

var GLOBAL_CANVAS = 'global';

function showSparse(){
    var renderer = new THREE.WebGLRenderer();
    var camera = new THREE.PerspectiveCamera();
    var scene = new THREE.Scene();
    scene.add(camera);
    renderer.render(scene, camera);
    $.getJSON('', function(data) {
        renderSparse(GLOBAL_CANVAS, data.points, data.cameras);
    });
}


function showPointCloud() {
    renderSparse();


}



function showParticles(data){
    var width = window.innerWidth,
        height = window.innerHeight;
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
    var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10000);
    var scene = new THREE.Scene();
    var particlesGeometry = new THREE.Geometry();
    data.forEach(function(point){
        particlesGeometry.vertices.push(new THREE.Vector3(point[0]*100, point[1]*100, point[2]*100));
    });
    var particlesMaterial = new THREE.ParticleSystemMaterial({
        color: 0xFFFFFF,
        size: 5,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    var particlesSystem = new THREE.ParticleSystem(particlesGeometry, particlesMaterial);
    particlesSystem.rotation.z = 4.6;

    var pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(0, 300, 200);
    scene.add(pointLight);

    camera.position.x = 1000;
    camera.position.y = 1000;
    camera.position.z = 1000;

    particlesSystem.position.x = 0;
    particlesSystem.position.y = 800;
    particlesSystem.position.z = 600;

    //camera.lookAt(particlesSystem.position);
    scene.add(particlesSystem);
    scene.add(camera);

    var clock = new THREE.Clock();

    function render(){
        particlesSystem.position.x += clock.getDelta()*100;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    render();
}


$(function(){
    $.getJSON('/dataset/mvs/option.txt.pset.json')
        .then(function(data){
            showParticles(data);
        });

//    showParticles();
});
