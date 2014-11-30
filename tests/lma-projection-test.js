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

function testCam(i){

    var cloud = sample.getViewSparse(i),
        data = sample.getView(i);

    var reference = cloud.map(function(track){
            return track.x;
        }),
        dataset = _.sample(cloud, 100),
        datasetRC = dataset.map(function(track){
            return track.x;
        }),
        datasetX = dataset.map(function(track){
            return track.X;
        }),
        datasetPairs = dataset.map(function(track){
            var rc = track.x;
            return {
                X: track.X,
                x: Vector.create(cord.RCtoImg(rc.row, rc.col, data.cam))
            };
        });

    var estPro = dlt(datasetPairs);

    var refined = lma(
        function(parameter){
            var pro = laUtils.inflateVector(parameter, 3, 4);
            return Vector.create(cloud.map(function(track, index){
                return geoUtils.getNormalizedDist(
                    cord.img2RT(pro.x(track.X), data.cam.height),
                    reference[index],
                    data.cam
                );
            }))
        },
        laUtils.flattenMatrix(estPro).x(1000),
        Vector.Zero(cloud.length)
    );

    var refinedPro = laUtils.inflateVector(refined, 3, 4);

    var estimated = datasetX.map(function(X){
        return cord.img2RT(estPro.x(X), data.cam.height);
    });


    var reprojectedDLT = cloud.map(function(track){
            var X = track.X;
            return cord.img2RT(estPro.x(X), data.cam.height);
        }),
        reprojectedLMA = cloud.map(function(track){
            var X = track.X;
            return cord.img2RT(refinedPro.x(X), data.cam.height);
        });


    return Promise.all([
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-all.png'    , i, reference),
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-all-dlt.png', i, reprojectedDLT),
        testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-all-lma.png', i, reprojectedLMA)

        // a small random sample set
        //testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-dataset.png'          , i, datasetRC),
        //testUtils.promiseVisualPoints('/home/sheep/Code/est-projection-est.png'              , i, estimated)
    ]);

}

testCam(6);

