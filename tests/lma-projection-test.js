'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    dlt = require('../src/webregister/estimate-projection.js'),
    lma = require('../src/math/levenberg-marquardt.js'),
    laUtils = require('../src/math/la-utils.js'),
    geoUtils = require('../src/math/geometry-utils.js');

function testCam(i){

    var cloud = sample.getViewSparse(i),
        data = sample.getView(i),
        reference = cloud.map(function(track){
            return track.x;
        }),
        dataset = _.sample(cloud, 100),
        datasetPairs = dataset.map(function(track){
            var rc = track.x;
            return {
                X: track.X,
                x: Vector.create(cord.rc2img(rc.row, rc.col))
            };
        });

    var estPro = dlt(datasetPairs);

    var refined = lma(
        function(parameter){
            var pro = laUtils.inflateVector(parameter, 3, 4);
            return Vector.create(cloud.map(function(track, index){
                return geoUtils.getDistanceRC(
                    cord.img2RC(pro.x(track.X)),
                    reference[index]
                );
            }))
        },
        laUtils.flattenMatrix(estPro).x(1000),
        Vector.Zero(cloud.length)
    );

    var refinedPro = laUtils.inflateVector(refined, 3, 4);

    var reprojectedDLT = cloud.map(function(track){
            var X = track.X;
            return cord.img2RC(estPro.x(X));
        }),
        reprojectedLMA = cloud.map(function(track){
            var X = track.X;
            return cord.img2RC(refinedPro.x(X));
        });


    return Promise.all([
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-all.png'    , i, reference),
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-all-dlt.png', i, reprojectedDLT),
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-all-lma.png', i, reprojectedLMA)
    ]);

}

testCam(19);