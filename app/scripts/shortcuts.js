'use strict';


function getImageCanvas(img){
    var fixedWidth = 1000;
    var canvas = document.createElement('canvas');
    canvas.height = img.height*fixedWidth/img.width;
    canvas.width = fixedWidth;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
}



function drawSift(ctx, img, features){
    var signSize = 3;
    _.forEach(features, function(feature){
        var x, y;
        if (feature.point) {
            x = feature.point.x*ctx.canvas.width/img.width;
            y = (img.height+1-feature.point.y)*ctx.canvas.height/img.height;
        }
        else if (feature.col && feature.row){
            x = feature.col*ctx.canvas.width/img.width;
            y = feature.row*ctx.canvas.height/img.height;
        }
        else {
            console.log(feature);
            throw 'feature invalid';
        }
        ctx.moveTo(x-signSize, y);
        ctx.lineTo(x+signSize, y);
        ctx.moveTo(x, y-signSize);
        ctx.lineTo(x, y+signSize);
    });
    ctx.stroke();
}



function drawFeatures(ctx, features, offsetX, offsetY, height, scale, options){
    options = options || {};
    _.defaults(options, {
        color: 'red',
        markSize: 7
    });

    ctx.beginPath();
    ctx.strokeStyle = options.color;
    ctx.lineWidth = options.markSize/2;
    _.each(features, function(feature){
        var x = offsetX + scale*feature.col,
            y = offsetY + scale*(height-1-feature.row);
        ctx.moveTo(x-options.markSize, y);
        ctx.lineTo(x+options.markSize, y);
        ctx.moveTo(x, y-options.markSize);
        ctx.lineTo(x, y+options.markSize);
    });
    ctx.stroke();
}



function drawTwoViewMatches(img1, img2, features1, features2, matches){
    var fixedWidth = 600;
    var ratio1 = fixedWidth/img1.width,
        ratio2 = fixedWidth/img2.width,
        height1 = img1.height*ratio1,
        height2 = img2.height*ratio2;
    var canvas = document.createElement('canvas');
    canvas.width = fixedWidth;
    canvas.height = height1+height2;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img1, 0, 0, fixedWidth, height1);
    ctx.drawImage(img2, 0, height1, fixedWidth, height2);

    drawFeatures(ctx, _.map(matches, function(match){
        return features1[match[0]];
    }), 0, 0, img1.height, ratio1);

    drawFeatures(ctx, _.map(matches, function(match){
        return features2[match[1]];
    }), 0, ratio1*img1.height, img2.height, ratio2, { color: 'green' });

    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    _.each(matches, function(match){
        var row1 = features1[match[0]].row,
            col1 = features1[match[0]].col,
            row2 = features2[match[1]].row,
            col2 = features2[match[1]].col;
        var x1 = ratio1*col1,
            y1 = ratio1*(img1.height-1-row1),
            x2 = ratio2*col2,
            y2 = ratio2*(img2.height-1-row2)+height1;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    });
    ctx.stroke();
}

function drawBundler(data){
    var width = window.innerWidth,
        height = window.innerHeight;
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
    var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10000);
    var scene = new THREE.Scene();


    var camerasGeo = new THREE.Geometry();
    data.cameras.forEach(function(cam){
        camerasGeo.vertices.push(new THREE.Vector3(cam.t[0], cam.t[1], cam.t[2]));
    });
    var particlesMaterial = new THREE.ParticleSystemMaterial({
        color: 0xFF0000,
        size: 2,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    var camerasSystem = new THREE.ParticleSystem(camerasGeo, particlesMaterial);


    var pointsGeo = new THREE.Geometry();
    data.points.forEach(function(p){
        pointsGeo.vertices.push(new THREE.Vector3(p.point[0], p.point[1], p.point[2]));
    });
    var pointsMaterial = new THREE.ParticleSystemMaterial({
        color: 0xFFFFFF,
        size: 1,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    var pointsSystem = new THREE.ParticleSystem(pointsGeo, pointsMaterial);


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
    var axisSystem = new THREE.Line(axisGeo, axisMaterial, THREE.Lines);


    var pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(1000, 1000, 1000);
    scene.add(pointLight);

    camera.position.x = -10;
    camera.position.y = -10;
    camera.position.z = -20;


    camera.lookAt(camerasSystem.position);
    scene.add(axisSystem);
    scene.add(camerasSystem);
    scene.add(pointsSystem);
    scene.add(viewSystem);
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