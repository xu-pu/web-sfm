"use strict";

function stereoTest(name1, name2){
    getSiftPair(name1, name2, function(features1, features2){
        getBundlerSample(function(data){
            console.log('data loaded');
            var cam1 = data.cameras[Number(name1)];
            var cam2 = data.cameras[Number(name2)];

            var stereoWorker = new Worker(SFM.STEREO_WORKER);
            console.log('worker created');
            stereoWorker.onmessage = function(e){
                console.log('worker returned');
                var data = e.data;
                drawPointCloud(data);
            };

            stereoWorker.postMessage({
                cam1: cam1,
                cam2: cam2,
                features1: features1,
                features2: features2
            });

            /*
            SFM.twoViewStereo(cam1, cam2, features1, features2, function(matches, triangulated){
                console.log(matches.length);
                drawPointCloud(triangulated);
            })
            */
        })
    })
}


function drawPointCloud(points){
    var width = window.innerWidth,
        height = window.innerHeight;
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
    var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10000);
    var scene = new THREE.Scene();


    var pointsGeo = new THREE.Geometry();
    points.forEach(function(point){
        var p = point.homogeneous();
//        console.log(p.data);
        pointsGeo.vertices.push(new THREE.Vector3(p.get(0,0), p.get(1,0), p.get(2,0)));
    });
    var particlesMaterial = new THREE.ParticleSystemMaterial({
        color: 0xFF0000,
        size: 2,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    var pointsSystem = new THREE.ParticleSystem(pointsGeo, particlesMaterial);

    var pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(1000, 1000, 1000);
    scene.add(pointLight);

    camera.position.x = -1000;
    camera.position.y = -1000;
    camera.position.z = -1000;


    camera.lookAt(pointsSystem.position);
    scene.add(pointsSystem);
    scene.add(camera);

    var clock = new THREE.Clock();

    function render(){
//        camera.rotation.x -= clock.getDelta();
//        camera.rotation.y -= clock.getDelta();
//        camera.rotation.z -= clock.getDelta();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    render();

}



$(function(){

//    getBundlerSample(function(data){
//        console.log('data loaded');
//        drawBundler(data);
//    });

    stereoTest('00000035', '00000040');

});
