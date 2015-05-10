'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    assert = require('assert');

var sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    laUtils = require('../src/math/la-utils.js'),
    geoUtils = require('../src/math/geometry-utils.js');

var ZERO_THRESHOLD = Math.pow(10, -11);


describe('Euler Angles', function(){

    var randomAlpha = Math.PI * Math.random(),
        randomBeta = 2* Math.PI * Math.random(),
        randomGamma = 2* Math.PI * Math.random();

    var randomRotationMatrix,
        reRandomAngles;


    describe('#getRotationMatrixFromEuler', function(){

        it('should run', function(){
            randomRotationMatrix = geoUtils.getRotationFromEuler(randomAlpha, randomBeta, randomGamma);
        });

    });


    describe('#getEulerAngles', function(){


        it('should run', function(){
            reRandomAngles = geoUtils.getEulerAngles(randomRotationMatrix);
            assert(_.isArray(reRandomAngles));
            assert(reRandomAngles.every(function(angle){
                return _.isNumber(angle) && angle >= 0 && angle < 2*Math.PI;
            }));
        });


        it('should have alpha < PI', function(){
            assert(reRandomAngles[0] < Math.PI);
        });


        it('should reverse, angles->matrix->angles', function(){
            var error = Math.max(
                Math.abs(reRandomAngles[0] - randomAlpha),
                Math.abs(reRandomAngles[1] - randomBeta),
                Math.abs(reRandomAngles[2] - randomGamma)
            );
            assert(error < ZERO_THRESHOLD);
        });


        it('should reverse, matrix->angles->matrix', function(){

            var index = Math.floor(50 * Math.random()),
                R = sample.getView(index).R,
                angles = geoUtils.getEulerAngles(R),
                reR = geoUtils.getRotationFromEuler(angles[0], angles[1], angles[2]),
                diff = reR.x(R.transpose()).subtract(Matrix.I(3));

            assert(laUtils.matrixInfiniteNorm(diff) < ZERO_THRESHOLD);

        });


    });


});