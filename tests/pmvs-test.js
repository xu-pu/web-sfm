'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var ImageCellGrid = require('../src/webmvs/image-cell-grid.js'),
    photometrics = require('../src/webmvs/photometrics.js'),
    Patch = require('../src/webmvs/patch.js'),
    sample = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    geoUtils = require('../src/math/geometry-utils.js');

var BETA = 2;
var MU = 5;

function ncctest(){

    var rIndex = 0;

    var cams = [2];

    Promise
        .all(cams.map(function(index){
            return sample.promiseImage(index)
        }))
        .then(function(imgs){

            var grids = cams.map(function(camIndex, i){
                var buffer = imgs[i];
                var cam = sample.getCalibratedCamera(camIndex);
                return new ImageCellGrid(buffer, cam, BETA);
            });

            var refer = grids[rIndex];
            var cloud = sample.getViewSparse(rIndex);
            var randompoint = cloud[10];
            var n = geoUtils.getEulerAngles(refer.cam.R);
            var c = randompoint.X;
            var p = new Patch({
                n: n,
                c: c,
                R: refer
            });

            var sams = photometrics.samplePatch(grids, p, MU);
            var referSample = sams[rIndex];

            var nccs = sams.map(function(s){
                return photometrics.ncc(s, referSample)
            });

            console.log(nccs);

        });

}

ncctest();