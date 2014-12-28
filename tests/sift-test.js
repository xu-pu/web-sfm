'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter');

var samples = require('../src/utils/samples.js'),
    visualUtils = require('../src/utils/testing.js'),
    testUtils = require('../src/utils/test-utils.js'),
    isNotEdge = require('../src/websift/edge-filter.js'),
    OctaveSpace = require('../src/websift/octave-space'),
    detector = require('../src/websift/detector.js');


var smallComet = 'Colour_image_of_comet.jpg',
    bigComet = 'Comet_on_5_September_2014.jpg',
    smallpic = '/home/sheep/Code/Project/web-sfm/tests/images/ibzi0xiqN0on8v.jpg';


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

                dogs.release();
                scales.release();

                oi = octaves.nextOctave;

            }

            return Promise.all([
//                testUtils.promiseVisualPoints('/home/sheep/Code/sift-detected.png', index, detected),
//                testUtils.promiseVisualPoints('/home/sheep/Code/sift-filtered.png', index, filter.results),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift.png', filePath, features),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-edge.png', filePath, _.difference(all, features)),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-all.png', filePath, all)
            ]);

        });
}


//pyramidTest(10);
//pyramidtest();
testExternal('/home/sheep/Downloads/comet/' + bigComet);
//testExternal(smallpic);
//testExternal(samples.getImagePath(3));