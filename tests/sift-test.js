'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter'),
    pool = require('ndarray-scratch');

var imgUtils = require('../src/utils/image-conversion.js'),
    samples = require('../src/utils/samples.js'),
    visualUtils = require('../src/utils/testing.js'),
    testUtils = require('../src/utils/test-utils.js'),
    OctaveSpace = require('../src/websift/octave-space'),
    detector = require('../src/websift/detector.js'),
    orientation = require('../src/websift/orientation.js'),
    descriptor = require('../src/websift/descriptor.js'),
    sift = require('../src/websift/websift.js'),
    siftUtils = require('../src/websift/utils.js');


var smallComet = 'Colour_image_of_comet.jpg',
    bigComet = 'Comet_on_5_September_2014.jpg',
    smallpic = '/home/sheep/Code/Project/web-sfm/tests/images/ibzi0xiqN0on8v.jpg';


function orientationTest(){
    var lena = imgUtils.rgb2gray(require('lena'));
    var scale = { img: lena, sigma: 1.6 };
    var f = { row: 100.6, col: 17.3, octave: 0, layer: 1 };
    var oriented = orientation.getOrientation(scale, f);
    console.log(oriented);
}

//orientationTest();

function descroptorTest(){
    var lena = imgUtils.rgb2gray(require('lena'));
    var scale = { img: lena, sigma: 1.6 };
    var f = { row: 150.6, col: 301.3, octave: 0, layer: 1, orientation: 1 };
    var des = descriptor.getDescriptor(scale, f);
    console.log(des.vector);
}

//descroptorTest();


function fulltest(img) {

    sift.forEachDetected(img, function(scale, detectedF){
        if (isNotEdge(scale, detectedF)) {
            console.log('detected');
        }
    });

}

//fulltest(imgUtils.rgb2gray(require('lena')));

function pyramidTest(index){

    var features = [],
        all = [];

    samples
        .promiseImage(index)
        .then(function(img){

            sift.forEachDetected(img, function(scale, detectedF){
                var factor = Math.pow(2, detectedF.octave);
                var f = { row: factor*detectedF.row, col: factor*detectedF.col };
                all.push(f);
                if (isNotEdge(scale, detectedF)) {
                    features.push(f);
                    console.log('detected');
                }
            });

            return Promise.all([
                visualUtils.promiseVisualPoints('/home/sheep/Code/sift.png', index, features),
                visualUtils.promiseVisualPoints('/home/sheep/Code/sift-all.png', index, all)
            ]);

        });
}



function testExternal(filePath){

    var features = [],
        all = [];

    testUtils.promiseImage(filePath)
        .then(function(img){

            sift.forEachDetected(img, function(detectedF){
                console.log('detected');
                var factor = Math.pow(2, detectedF.octave),
                    f = { row: factor*detectedF.row, col: factor*detectedF.col };
                features.push(f);
            });

            return Promise.all([
                testUtils.promiseVisualPoints('/home/sheep/Code/sift.png', filePath, features)
//                testUtils.promiseVisualPoints('/home/sheep/Code/sift-edge.png', filePath, _.difference(all, features)),
//                testUtils.promiseVisualPoints('/home/sheep/Code/sift-all.png', filePath, all)
            ]);

        });
}

function testGradient(path){
    return testUtils.promiseImage(path)
        .then(function(img){
            var cache = siftUtils.cacheGradient(img),
                width = img.shape[0],
                height = img.shape[1],
                buffer = pool.malloc([width, height]),
                ratio = 5;
            var r, c;
            for (r=0; r<height; r++) {
                for (c=0; c<width; c++) {
                    buffer.set(c, r, ratio*cache.get(c, r, 0));
                }
            }
            testUtils.promiseSaveNdarray('/home/sheep/Code/gradient.png', buffer);
        });
}


//pyramidTest(10);
//pyramidtest();
//testExternal(samples.getImagePath(1));
//testExternal('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/images/000.png');
//testExternal('/home/sheep/Downloads/comet-demo/' + smallComet);
//testExternal('/home/sheep/Downloads/comet-demo/' + bigComet);
//testExternal(smallpic);
//testExternal(samples.getImagePath(3));
testGradient('/home/sheep/Downloads/comet-demo/' + bigComet);
