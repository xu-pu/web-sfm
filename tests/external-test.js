'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter');

var imgUtils = require('../src/utils/image-conversion.js'),
    samples = require('../src/utils/samples.js'),
    visualUtils = require('../src/utils/testing.js'),
    testUtils = require('../src/utils/test-utils.js'),
    isNotEdge = require('../src/websift/edge-filter.js'),
    OctaveSpace = require('../src/websift/octave-space'),
    detector = require('../src/websift/detector.js'),
    orientation = require('../src/websift/orientation.js'),
    descriptor = require('../src/websift/descriptor.js'),
    sift = require('../src/websift/websift.js'),
    externalUtils = require('../src/utils/external-utils.js');


var cometRoot = '/home/sheep/Downloads/comet/',
    smallComet = 'Colour_image_of_comet.jpg',
    bigComet = 'Comet_on_5_September_2014.jpg',
    smallpic = '/home/sheep/Code/Project/web-sfm/tests/images/ibzi0xiqN0on8v.jpg',
    samplepic = '/home/sheep/Code/Project/web-sfm/tests/images/ibzi0xiqN0on8v.jpg';


function testLoweSIFT(path){
    externalUtils.loweSIFT(path)
        .then(function(data){
            return testUtils.promiseVisualPoints('/home/sheep/Code/lowe-sift-test.png', path, data)
        });
}

testLoweSIFT(cometRoot+bigComet);