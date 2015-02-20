'use strict';

var _ = require('underscore'),
    Promise = require('promise');

var imgUtils = require('../src/utils/image-conversion.js'),
    samples = require('../src/utils/samples.js'),
    visualUtils = require('../src/utils/testing.js'),
    testUtils = require('../src/utils/test-utils.js'),
    externalUtils = require('../src/utils/external-utils.js');

var cometRoot = '/home/sheep/Downloads/comet-demo/',
    smallComet = 'Colour_image_of_comet.jpg',
    bigComet = 'Comet_on_5_September_2014.jpg',
    smallpic = '/home/sheep/Code/Project/web-sfm/tests/images/ibzi0xiqN0on8v.jpg',
    samplepic = '/home/sheep/Code/Project/web-sfm/tests/images/ibzi0xiqN0on8v.jpg',
    cometPair1 = 'Comet_on_7_August_a.jpg',
    cometPair2 = 'Comet_on_7_August_b.jpg';


function testLoweSIFT(path){
    externalUtils.loweSIFT(path)
        .then(function(data){
            return testUtils.promiseVisualPoints('/home/sheep/Code/lowe-sift-test.png', path, data)
        });
}

//testLoweSIFT(cometRoot+cometPair1);

function preparePair(){

    var pathA = cometRoot + cometPair1,
        pathB = cometRoot + cometPair2;

    externalUtils.loweSIFT(pathA)
        .then(function(featuresA){
            return testUtils.promiseSaveJson('/home/sheep/Code/comet-pair-A.json', featuresA);
        })
        .then(function(){
            return externalUtils.loweSIFT(pathB);
        })
        .then(function(featuresB){
            return testUtils.promiseSaveJson('/home/sheep/Code/comet-pair-B.json', featuresB);
        })
        .then(function(){
            console.log('features generated');
        });

}
//preparePair();
//testUtils.promiseVisualPoints('/home/sheep/Code/comet-pair-A.png', cometRoot + cometPair1, require('/home/sheep/Code/comet-pair-A.json'));
//testUtils.promiseVisualPoints('/home/sheep/Code/comet-pair-B.png', cometRoot + cometPair2, require('/home/sheep/Code/comet-pair-B.json'));
