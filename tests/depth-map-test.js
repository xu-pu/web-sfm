'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    pool = require('ndarray-scratch');

var sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js');

var DEPTHMAP_RESOLUTION = 3,
    DEPTHMAP_SCALE = 255;

function testCamDense(index){

    var data = sample.getView(index),
        cloud = sample.getViewDense(index),
        R = data.R,
        t = data.t,
        focal = data.f;

    var maxDist = -Infinity, minDist = Infinity;

    return sample.promiseCanvasImage(index)
        .then(function(img){

            var projector = projections.getProjectionMatrix(R, t, focal, img.width, img.height);
            var perspectiveTrans = projections.getPerspective(R, t);

            var rows = Math.ceil(data.cam.height/DEPTHMAP_RESOLUTION),
                cols = Math.ceil(data.cam.width/DEPTHMAP_RESOLUTION);

            var depthmap = pool.zeros([rows, cols]);

            cloud.forEach(function(p){
                var x = projector.x(p),
                    pers = perspectiveTrans.x(p),
                    depth = pers.e(3)/pers.e(4),
                    rc = cord.img2RC(x),
                    cellRow = Math.floor(rc.row/DEPTHMAP_RESOLUTION),
                    cellCol = Math.floor(rc.col/DEPTHMAP_RESOLUTION);

                if (depthmap.get(cellRow, cellCol) < depth) {
                    depthmap.set(cellRow, cellCol, depth);
                }

                if (depth > maxDist) { maxDist = depth; }
                if (depth < minDist) { minDist = depth; }

            });

            var scale = DEPTHMAP_SCALE/(maxDist-minDist);

            var r, c, cursor;

            for (r=0; r<rows; r++) {
                for (c=0; c<cols; c++) {
                    cursor = depthmap.get(r,c);
                    if (cursor !== 0) {
                        depthmap.set(r,c, 255-scale*(cursor-minDist));
                    }
                }
            }

            return testUtils.promiseSaveNdarray(depthmap, '/home/sheep/Code/depth-map-test.png');

        });

}

testCamDense(50);