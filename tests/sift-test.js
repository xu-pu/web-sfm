'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter');

var samples = require('../src/utils/samples.js'),
    getOrientation = require('../src/websift/orientation.js'),
    getGuassianKernel = require('../src/math/kernels.js').getGuassianKernel,
    visualUtils = require('../src/utils/testing.js'),
    testUtils = require('../src/utils/test-utils.js'),
    imgUtils = require('../src/utils/image-conversion.js'),
    isNotEdge = require('../src/websift/edge-filter.js'),
    OctaveSpace = require('../src/websift/octave-space'),
    detector = require('../src/websift/detector.js'),
    siftOrientation = require('../src/websift/orientation.js');


function pyramidTest(index){

    var features = [],
        all = [];

    samples
        .promiseImage(index)
        .then(function(img){

            var octaves = new OctaveSpace(img),
                oct, scales, dogs, ratio,
                oi = octaves.nextOctave;

            while (octaves.hasNext()) {

                oct    = octaves.next();
                scales = oct.scales;
                dogs   = oct.dogs;
                ratio  = Math.pow(2, oi);

                detector(

                    dogs, scales,

                    /**
                     * SIFT detector callback
                     * @param {Scale} scale
                     * @param {number} row
                     * @param {number} col
                     */
                    function(scale, row, col){
                        var f = { row: ratio * row, col: ratio * col };
                        all.push(f);
                        if (isNotEdge(scale, row, col)) {
                            console.log('found one');
                            features.push(f);
                        }
                    }

                );

                oi = octaves.nextOctave;

            }


            return Promise.all([
//                testUtils.promiseVisualPoints('/home/sheep/Code/sift-detected.png', index, detected),
//                testUtils.promiseVisualPoints('/home/sheep/Code/sift-filtered.png', index, filter.results),
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

            var octaves = new OctaveSpace(img),
                oct, scales, dogs, ratio,
                oi = octaves.nextOctave;

            while (octaves.hasNext()) {

                oct    = octaves.next();
                scales = oct.scales;
                dogs   = oct.dogs;
                ratio  = Math.pow(2, oi);

                detector(

                    dogs, scales,

                    /**
                     * SIFT detector callback
                     * @param {Scale} scale
                     * @param {number} row
                     * @param {number} col
                     */
                    function(scale, row, col){
                        var f = { row: ratio * row, col: ratio * col };
                        all.push(f);
                        if (isNotEdge(scale, row, col)) {
                            console.log('found one');
                            features.push(f);
                        }
                    }

                );

                oi = octaves.nextOctave;

            }

            return Promise.all([
//                testUtils.promiseVisualPoints('/home/sheep/Code/sift-detected.png', index, detected),
//                testUtils.promiseVisualPoints('/home/sheep/Code/sift-filtered.png', index, filter.results),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift.png', filePath, features),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-all.png', filePath, all)
            ]);

        });
}


/**
 * @constructor
 */
function PointFilter(){

    this.edge = [];
    this.results = [];

    this.check = function(dogspace, layer, row, col, step) {
        var point = { row: row * step, col: col * step };
        if (isNotEdge(dogspace.dogs[layer], row, col)) {
            this.results.push(point);
            console.log('Found one!');
        }
        else {
            this.edge.push(point);
            console.log('Did not pass edge filter');
        }
    };
}

//pyramidTest(10);
//pyramidtest();
testExternal('/home/sheep/Downloads/comet/Comet_on_5_September_2014.jpg');