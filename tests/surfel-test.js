'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    interp = require("ndarray-linear-interpolate").d3;

var halldemo = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/test-utils.js'),
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

sortPatches();

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