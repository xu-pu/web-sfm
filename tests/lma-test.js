'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var bundler = require('../src/math/bundler.js'),
    sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    dlt = require('../src/webregister/estimate-projection.js'),
    lma = require('../src/math/levenberg-marquardt.js'),
    laUtils = require('../src/math/la-utils.js'),
    geoUtils = require('../src/math/geometry-utils.js');


function testMatrix(m){

    var DATASET_SIZE = 100,
        X_RANGE = 10;

    var rows = m.rows(),
        cols = m.cols(),
        xs = cols,
        ys = rows,
        flattenSize = rows*cols;

    var dataset = _.range(DATASET_SIZE).map(function(){
        var x = Vector.Random(xs).x(X_RANGE),
            y = m.x(x);
        return { x: x, y: y };
    });

    var error = Vector.create(_.range(flattenSize).map(function(){
        return 2*(Math.random()-1);
    }));

    var startpoint = laUtils.flattenMatrix(m).add(error);

    var refined = lma(
        function(parameters){
            var estM = laUtils.inflateVector(parameters, rows, cols);
            return Vector.create(dataset.map(function(xy){
                return estM.x(xy.x).subtract(xy.y).modulus();
            }));
        },
        startpoint,
        Vector.Zero(DATASET_SIZE)
    );

    return laUtils.inflateVector(refined, rows, cols);

}

var sampleM = Matrix.Random(5,6);

testMatrix(sampleM);