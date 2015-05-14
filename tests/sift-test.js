'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter'),
    pool = require('ndarray-scratch'),
    ndarray = require('ndarray');

var demoloader = require('../src/utils/demo-loader.js'),
    cometdemo = demoloader.cometdemo,
    halldemo = demoloader.halldemo,
    imgUtils = require('../src/utils/image-conversion.js'),
    samples = require('../src/utils/samples.js'),
    visualUtils = require('../src/utils/testing.js'),
    testUtils = require('../src/utils/test-utils.js'),
    GuassianPyramid = require('../src/websift/guassian-pyramid.js'),
    orientation = require('../src/websift/orientation.js'),
    descriptor = require('../src/websift/descriptor.js'),
    sift = require('../src/websift/websift.js'),
    siftUtils = require('../src/websift/utils.js'),
    match = require('../src/webmatcher/matcher.js'),
    estF = require('../src/webregister/estimate-fmatrix.js');


var smallComet = 'Colour_image_of_comet.jpg',
    bigComet = 'Comet_on_5_September_2014.jpg',
    smallpic = '/home/sheep/Code/Project/web-sfm/tests/images/ibzi0xiqN0on8v.jpg';


function vectorTest(){

    var lena = imgUtils.rgb2gray(require('lena'));
    var lenaG = siftUtils.cacheGradient(lena);
    var width = lena.shape[0];
    var height = lena.shape[1];
    /** @type OrientedFeature */
    var f = {
        row: height*Math.random(),
        col: width*Math.random(),
        octave: 0,
        scale: 3,
        layer: 1,
        orientation: 1
    };

    var v = descriptor.getVector(lenaG, f);

    console.log(v.join(','));


}

//vectorTest();

function fulltest(path, savepath){
    return testUtils
        .promiseImage(path)
        .then(function(img){
            var result = sift.sift(img);
            var pArr = new Float32Array(result.points);
            var points = ndarray(pArr, [result.length, 4]);
            return Promise.all([
                testUtils.visPoints(savepath+'.png', path, points),
                testUtils.promiseSaveArrayBuffer(savepath+'.points', result.points),
                testUtils.promiseSaveArrayBuffer(savepath+'.vectors', result.vectors)
            ]);
        });

}

//fulltest(cometdemo.getImagePath(3), '/home/sheep/Code/comet.test.2');


var MY_MATCHES_PATH = '/home/sheep/Code/cometmatches.json';

function matchtest(){
    var path1 = '/home/sheep/Code/comet.test.1';
    var path2 = '/home/sheep/Code/comet.test.2';
    return Promise.all([
        testUtils.promiseArrayBuffer(path1+'.points'),
        testUtils.promiseArrayBuffer(path2+'.points'),
        testUtils.promiseArrayBuffer(path1+'.vectors'),
        testUtils.promiseArrayBuffer(path2+'.vectors')
    ]).then(function(results){
        var pBuffer1 = results[0],
            pBuffer2 = results[1],
            vBuffer1 = results[2],
            vBUffer2 = results[3];
        var pArr1 = new Float32Array(pBuffer1),
            pArr2 = new Float32Array(pBuffer2),
            vArr1 = new Uint8Array(vBuffer1),
            vArr2 = new Uint8Array(vBUffer2);
        var length1 = pArr1.length/4;
        var length2 = pArr2.length/4;
        var points1 = ndarray(pArr1, [length1, 4]);
        var points2 = ndarray(pArr2, [length2, 4]);
        var vectors1 = ndarray(vArr1, [length1, 128]);
        var vectors2 = ndarray(vArr2, [length2, 128]);
        var ms = match.match(vectors1, vectors2);
        return testUtils.promiseSaveJson(MY_MATCHES_PATH, ms);
    });

}

//matchtest();

function vistest(){
    var path1 = '/home/sheep/Code/comet.test.1';
    var path2 = '/home/sheep/Code/comet.test.2';
    return Promise.all([
        testUtils.promiseArrayBuffer(path1+'.points'),
        testUtils.promiseArrayBuffer(path2+'.points'),
        testUtils.promiseArrayBuffer(path1+'.vectors'),
        testUtils.promiseArrayBuffer(path2+'.vectors')
    ]).then(function(results){
        var pBuffer1 = results[0],
            pBuffer2 = results[1],
            vBuffer1 = results[2],
            vBUffer2 = results[3];
        var pArr1 = new Float32Array(pBuffer1),
            pArr2 = new Float32Array(pBuffer2),
            vArr1 = new Uint8Array(vBuffer1),
            vArr2 = new Uint8Array(vBUffer2);
        var length1 = pArr1.length/4;
        var length2 = pArr2.length/4;
        var points1 = ndarray(pArr1, [length1, 4]);
        var points2 = ndarray(pArr2, [length2, 4]);
        var vectors1 = ndarray(vArr1, [length1, 128]);
        var vectors2 = ndarray(vArr2, [length2, 128]);

        var cam = { width: 3008, height: 2000 };

        var matches = require(MY_MATCHES_PATH);

        var data = estF(matches, {
            features1: points1,
            features2: points2,
            cam1: cam,
            cam2: cam
        });

        return Promise.all([
            testUtils.visMatches('/home/sheep/Code/mymatches.png', cometdemo.getImagePath(2), cometdemo.getImagePath(3), points1, points2, data.dataset),
            testUtils.visDetailedMatches(
                '/home/sheep/Code/mymatches.detail.png',
                cometdemo.getImagePath(2), cometdemo.getImagePath(3),
                points1, points2,
                _.sample(data.dataset, 100), data.F
            )
        ]);

    });

}
//vistest();


function convertProject(demo){
    demo.images.forEach(function(img){

        var id = img.id;
        var path = demo.getImagePath(id);
        var pointsPath = demo.dirroot + '/feature.point/'+img.name + '.point',
            vectorsPath = demo.dirroot + '/feature.vector/' + img.name + '.vector';

        testUtils
            .promiseImage(path)
            .then(function(imgBuffer){
                var results = sift.sift(imgBuffer);
                return Promise.all([
                    testUtils.promiseSaveArrayBuffer(pointsPath, results.points),
                    testUtils.promiseSaveArrayBuffer(vectorsPath, results.vectors)
                ]);
            });

        //console.log(pointsPath);
        //console.log(vectorsPath);
    });
}

convertProject(cometdemo);