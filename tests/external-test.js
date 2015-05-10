'use strict';

var _ = require('underscore'),
    Promise = require('promise');

var projections = require('../src/math/projections.js'),
    decompositions = require('../src/webregister/decompositions.js'),
    imgUtils = require('../src/utils/image-conversion.js'),
    samples = require('../src/utils/samples.js'),
    visualUtils = require('../src/utils/testing.js'),
    testUtils = require('../src/utils/test-utils.js'),
    externalUtils = require('../src/utils/external-utils.js'),
    estFmatrix = require('../src/webregister/estimate-fmatrix.js');

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

function estF(){

    var features1 = require('/home/sheep/Code/comet-pair-A.json'),
        features2 = require('/home/sheep/Code/comet-pair-B.json'),
        matches = require('/home/sheep/Code/comet-matches-0.1.json');

    var results = estFmatrix(
        matches,
        {
            features1: features1,
            features2: features2,
            cam1: { width: 2048, height: 2048 },
            cam2: { width: 2048, height: 2048 }
        }
    );

    var F = results.F;

    var K1 = projections.getK(1.2 * 2048, 1024, 1024);
    var K2 = projections.getK(1.2 * 2048, 1024, 1024);

    var E = K1.transpose().x(F).x(K2);

    var decs = decompositions.ematrix2Rt(E);




/*
    testUtils.promiseDetailedMatches(
        '/home/sheep/Code/comet-fmatrix-demo.png',
        cometRoot + cometPair1,
        cometRoot + cometPair2,
        features1,
        features2,
        _.sample(results.dataset, 100),
        results.F
    );
*/



}


function packParams(fa,pax1,pay1,fb,pbx1,pby1,R1,t1){}
function unpackParams(v){}

estF();

//preparePair();
//testUtils.promiseVisualPoints('/home/sheep/Code/comet-pair-A.png', cometRoot + cometPair1, require('/home/sheep/Code/comet-pair-A.json'));
//testUtils.promiseVisualPoints('/home/sheep/Code/comet-pair-B.png', cometRoot + cometPair2, require('/home/sheep/Code/comet-pair-B.json'));

//var matches = matcher(require('/home/sheep/Code/comet-pair-A.json'), require('/home/sheep/Code/comet-pair-B.json'));
//testUtils.promiseSaveJson('/home/sheep/Code/comet-matches-0.1.json', matches);
