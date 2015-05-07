'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var genRamdom = require('../src/utils/random.js'),
    laUtils = require('../src/math/la-utils.js'),
    descriptor = require('../src/websift/descriptor.js');


describe('websift', function(){

    describe('descriptor', function(){

        describe('#hist2vector', function(){

            var hist = _.range(128).map(function(){
                return 100*Math.random();
            });

            var vector = descriptor.hist2vector(hist);

            it('all elements are integer of [0,255]', function(){

                //console.log(vector.join(','));

                assert(vector.every(function(e){
                    return e >=0 && e <= 255 && (e % 1 === 0);
                }));
            });

        });

    });

});