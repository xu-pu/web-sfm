var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Plane = la.Plane,
    Line = la.Line,
    Promise = require('promise'),
    ndarray = require('ndarray'),
    toBuffer = require('arraybuffer-to-buffer');

var viewGeo = require('../src/webmvs/view-geometry.js'),
    photometrics = require('../src/webmvs/photometrics.js'),
    sample = require('../src/utils/samples.js'),
    projection = require('../src/math/projections.js'),
    halldemo = require('../src/utils/demo-loader.js').halldemo,
    testUtils = require('../src/utils/test-utils.js');

function testPatchAxis(){
    var patch = halldemo.requireDense()[200];
    var consistent = patch.consistent;
    var c = Vector.create(patch.point.slice(0,3));
    var n = Vector.create(patch.norm.slice(0,3));
    var anglelist = consistent
        .map(function(camid){
            var view = sample.getView(camid);
            var T = projection.getT(view.R, view.t);
            var trace = T.subtract(c);
            var viewAngle = n.angleFrom(trace);
            if (!viewAngle) {
                console.log('angle error');
            }
            return { cam: camid, angle: viewAngle };
        })
        .sort(function(a,b){
            return a.angle- b.angle;
        });
    var optimalCamId = anglelist[0].cam;

    var view = sample.getView(optimalCamId);
    var axis = viewGeo.getPatchAxis(c, n, view);

    console.log(axis);

    sample.promiseImage(optimalCamId, true).then(function(img){
        var rgb = photometrics.sampleRGB(c, axis[0], axis[1], view.P, img);
        console.log(rgb);
        console.log(patch);
    });

    //console.log(optimalCamId);
}

var COLOR_PATH = '/home/sheep/Code/dense-color.json';

function refinedColor(){
    Promise
        .all(_.range(61).map(function(i){
            return sample.promiseImage(i, true);
        }))
        .then(function(images){
            var cameras = _.range(61).map(function(i){
                return sample.getView(i);
            });
            var patches = halldemo.requireDense();

            var colors = patches.map(eachPatch);

            return testUtils.promiseSaveJson(COLOR_PATH, colors);

            function eachPatch(patch){
                var consistent = patch.consistent;
                var c = Vector.create(patch.point.slice(0,3));
                var n = Vector.create(patch.norm.slice(0,3));
                var anglelist = consistent
                    .map(function(camid){
                        var view = cameras[camid];
                        var T = projection.getT(view.R, view.t);
                        var trace = T.subtract(c);
                        var viewAngle = n.angleFrom(trace);
                        if (!viewAngle) {
                            console.log('angle error');
                        }
                        return { cam: camid, angle: viewAngle };
                    })
                    .sort(function(a,b){
                        return a.angle- b.angle;
                    });
                var optimalCamId = anglelist[0].cam;
                var view = cameras[optimalCamId];
                var axis = viewGeo.getPatchAxis(c, n, view);
                return photometrics.sampleRGB(c, axis[0], axis[1], view.P, images[optimalCamId]);
            }

        });
}

var colors = require(COLOR_PATH);
var len = colors.length;
var factor = 2*2/25;
var arr = new Uint8Array(len*3);
var ndarr = ndarray(arr, [len, 3]);
colors.forEach(function(rgb, i){
    ndarr.set(i, 0, rgb.R);
    ndarr.set(i, 1, rgb.G);
    ndarr.set(i, 2, rgb.B);
});
testUtils.promiseSaveArrayBuffer('/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/mvs/surfels.colors', arr.buffer);


//refinedColor();
//testPatchAxis();