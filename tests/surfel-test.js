'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    ndarray = require('ndarray'),
    pool = require('ndarray-scratch'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    ArrayBufferToBuffer = require('arraybuffer-to-buffer'),
    interp = require("ndarray-linear-interpolate").d3;

var halldemo = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/test-utils.js'),
    externalUtils = require('../src/utils/external-utils.js'),
    cord = require('../src/utils/cord.js');

var cloud= require('../demo/Hall-Demo/mvs/patches.json');

//console.log(cloud[2]);

function getViewSurfel(i){

    var visiable = cloud.filter(function(p){
        return p.consistent.indexOf(i) !== -1;
    });

    var cam = halldemo.getCalibratedCamera(i),
        P = cam.P;

    halldemo
        .promiseImage(i, true)
        .then(function(img){

            var surfels = visiable.map(function(patch){
                var p = Vector.create(patch.point);
                var projected = P.x(p);
                var pix = cord.img2RC(projected);
                var color = {
                    R: interp(img, pix.col, pix.row, 0),
                    G: interp(img, pix.col, pix.row, 1),
                    B: interp(img, pix.col, pix.row, 2)
                };
                return {
                    point: patch.point,
                    color: color
                };
            });

            return testUtils.promiseSaveJson('/home/sheep/Code/surfels.json', surfels);

        }).then(function(){
            console.log('Done');
        });

}

function getLimits(arr){
    var max = -Infinity, min=Infinity;
    var cursor;
    for (var i=0; i<arr.length; i++) {
        cursor = arr[i];
        if (cursor < min) {
            min = cursor;
        }
        if (cursor > max) {
            max = cursor;
        }
    }
    return [min, max];
}


function divedPatches(){

    var Interval = 11;

    var buffer = _.range(6).map(function(){ return []; });

    cloud.forEach(function(patch){

        var index = patch.consistent[0];

        var bin = Math.floor(index/Interval);

        buffer[bin].push(patch);

    });

    return Promise
        .all(buffer.map(function(bin, i){
            console.log(i);
            return testUtils.promiseSaveJson('/home/sheep/Code/gltest/data/patches'+ i + '.json', bin);
        }))
        .then(function(){
            console.log('done');
        });

}

//divedPatches();

function sortPatches(){

    Promise.all(_.range(61).map(function(imgIndex){
        return halldemo.promiseImage(imgIndex, true);
    })).then(function(images){
        var cams = _.range(61).map(function(camIndex){
            return halldemo.getCalibratedCamera(camIndex).P;
        });
        var surfels = cloud.map(function(patch){
            var refer = patch.consistent[0];
            var img = images[refer];
            var P = cams[refer];
            var p = Vector.create(patch.point);
            var projected = P.x(p);
            var pix = cord.img2RC(projected);
            var color = {
                R: interp(img, pix.col, pix.row, 0),
                G: interp(img, pix.col, pix.row, 1),
                B: interp(img, pix.col, pix.row, 2)
            };
            return {
                point: patch.point,
                color: color
            };
        });
        return testUtils.promiseSaveJson('/home/sheep/Code/gltest/data/surfels.json', surfels);
    }).then(function(){
        console.log('saved');
    });

}

//sortPatches();

function promiseOneView(i, patches){

    var cam = halldemo.getCalibratedCamera(i),
        P = cam.P;

    halldemo
        .promiseImage(i, true)
        .then(function(img){

            var surfels = patches.map(function(patch){
                var p = Vector.create(patch.point);
                var projected = P.x(p);
                var pix = cord.img2RC(projected);
                var color = {
                    R: interp(img, pix.col, pix.row, 0),
                    G: interp(img, pix.col, pix.row, 1),
                    B: interp(img, pix.col, pix.row, 2)
                };
                return {
                    point: patch.point,
                    color: color
                };
            });

            return testUtils.promiseSaveJson('/home/sheep/Code/gltest/data/surfels'+ i + '.json', surfels);

        }).then(function(){
            console.log(i + 'th is done');
        });

}


//getViewSurfel(3);

function convertSurfels(){

    var surfels = require('/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/mvs/surfels.json');
    var length = surfels.length;
    var vertextArray = new Float32Array(length*3);
    var vertexBuffer = ndarray(vertextArray, [length, 3]);
    var colorArray = new Uint8Array(length*3);
    var colorBuffer = ndarray(colorArray, [length, 3]);


    surfels.forEach(function(patch, i){
        var point = patch.point;
        var color = patch.color;
        vertexBuffer.set(i, 0, point[0]);
        vertexBuffer.set(i, 1, point[1]);
        vertexBuffer.set(i, 2, point[2]);
        colorBuffer.set(i, 0, color.R);
        colorBuffer.set(i, 1, color.G);
        colorBuffer.set(i, 2, color.B);
    });

    console.log(vertexBuffer.data.buffer.byteLength);

    var buffer = ArrayBufferToBuffer(vertexBuffer.data.buffer);

    testUtils.promiseWriteFile('/home/sheep/Code/gltest/data/surfels-array', buffer);
    testUtils.promiseWriteFile('/home/sheep/Code/gltest/data/surfels-color-array', ArrayBufferToBuffer(colorBuffer.data.buffer));

}

function convertSpase(){

    var surfels = halldemo.sparse;
    var length = surfels.length;
    var vertextArray = new Float32Array(length*3);
    var vertexBuffer = ndarray(vertextArray, [length, 3]);
    var colorArray = new Uint8Array(length*3);
    var colorBuffer = ndarray(colorArray, [length, 3]);


    surfels.forEach(function(patch, i){
        var point = patch.point;
        var color = patch.color;
        vertexBuffer.set(i, 0, point[0]);
        vertexBuffer.set(i, 1, point[1]);
        vertexBuffer.set(i, 2, point[2]);
        colorBuffer.set(i, 0, color.R);
        colorBuffer.set(i, 1, color.G);
        colorBuffer.set(i, 2, color.B);
    });

    var buffer = ArrayBufferToBuffer(vertexBuffer.data.buffer);

    testUtils.promiseWriteFile('/home/sheep/Code/gltest/data/surfels-array', buffer);
    testUtils.promiseWriteFile('/home/sheep/Code/gltest/data/surfels-color-array', ArrayBufferToBuffer(colorBuffer.data.buffer));

}

//convertSpase();
//convertSurfels();
function convertSIFT(){
    var root = '/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/sift.json/';

    var i, features, path;
    for (i=0; i<=60; i++) {
        path = root+halldemo.getFullname(i)+'.json';
        features = require(path);
        testUtils.promiseSaveJson(path, features.features);
    }
}

//externalUtils.genImagesJson(require('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/description.json'));

_.range(61).forEach(function(index){

    var features = halldemo.getFeatures(index);
    var amount = features.length;
    var pointBuffer = pool.malloc([amount,4], 'float32'), vectorBuffer = pool.malloc([amount, 128], 'uint8');
    features.forEach(function(f, index){

        pointBuffer.set(index, 0, f.row);
        pointBuffer.set(index, 1, f.col);
        pointBuffer.set(index, 2, f.direction);
        pointBuffer.set(index, 3, f.scale);

        f.vector.forEach(function(v, i){
            vectorBuffer.set(index, i, v);
        });

    });

    Promise.all([
        testUtils.promiseWriteFile('/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/feature.point/'  + halldemo.getFullname(index) + '.point' , ArrayBufferToBuffer(pointBuffer.data.buffer)),
        testUtils.promiseWriteFile('/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/feature.vector/' + halldemo.getFullname(index) + '.vector', ArrayBufferToBuffer(vectorBuffer.data.buffer))
    ]).then(function(){
        pool.free(pointBuffer);
        pool.free(vectorBuffer);
    });

});