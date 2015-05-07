'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var genRamdom = require('../src/utils/random.js'),
    laUtils = require('../src/math/la-utils.js'),
    descriptor = require('../src/websift/descriptor.js'),
    imgUtils = require('../src/utils/image-conversion.js'),
    siftUtils = require('../src/websift/utils.js');

var lena = imgUtils.rgb2gray(require('lena'));
var lenaG = siftUtils.cacheGradient(lena);
var width = lena.shape[0];
var height = lena.shape[1];

/**
 * @param {number[]} arr
 * @returns {boolean}
 */
function isValidDescriptor(arr){
    return arr.every(function(e){
        return e >=0 && e <= 255 && (e % 1 === 0);
    });
}

describe('websift', function(){

    describe('descriptor', function(){

        describe('#getVector', function(){

            /** @type OrientedFeature */
            var f = {
                row: height*Math.random(),
                col: width*Math.random(),
                octave: 0,
                scale: 1.2,
                layer: 1,
                orientation: 1
            };

            it('runs', function(){
                var vector = descriptor.getVector(lenaG, f);
                assert(isValidDescriptor(vector));
            });

        });

        describe('#hist2vector', function(){

            var hist = _.range(128).map(function(){
                return 100*Math.random();
            });

            var vector = descriptor.hist2vector(hist);

            it('all elements are integer of [0,255]', function(){
                //console.log(vector.join(','));
                assert(isValidDescriptor(vector));
            });

        });

    });

});