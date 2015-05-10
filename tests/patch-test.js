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
    camUtils = require('../src/math/projections.js'),
    halldemo = require('../src/utils/demo-loader.js').halldemo,
    cityhalldemo = require('../src/utils/demo-loader.js').cityhalldemo,
    testUtils = require('../src/utils/test-utils.js');

var COLOR_PATH = '/home/sheep/Code/dense-color.json';

var camshape = { height: 2048, width: 3072 };

function refinedColor(){
    Promise
        .all(_.range(7).map(function(i){
            return cityhalldemo.promiseImage(i, true);
        }))
        .then(function(images){
            var cDict = require('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/optimized-cams.json');
            var mDict = _.mapObject(cDict, function(params){ return camUtils.params2model(params); });
            var pDict = _.mapObject(mDict, function(model){ return camUtils.model2P(model); });
            var tDict = _.mapObject(mDict, function(model){ return camUtils.model2T(model); });
            var kDict = _.mapObject(mDict, function(model, ci){
                /** @type {CameraParams} */
                var params = cDict[ci];
                return {
                    R: model.R,
                    t: model.t,
                    T: tDict[ci],
                    P: pDict[ci],
                    focal: params.f,
                    px: params.px,
                    py: params.py,
                    cam: camshape
                };
            });

            var patches = require('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/patches.json');

            var colors = patches.map(eachPatch);

            return testUtils.promiseSaveJson(COLOR_PATH, colors);

            function eachPatch(patch){
                var consistent = patch.consistent;
                var c = Vector.create(patch.point.slice(0,3));
                var n = Vector.create(patch.norm.slice(0,3));
                var anglelist = consistent
                    .map(function(ci){
                        var T = tDict[ci];
                        var trace = T.subtract(c);
                        var viewAngle = n.angleFrom(trace);
                        if (!viewAngle) {
                            console.log('angle error');
                        }
                        return { cam: ci, angle: viewAngle };
                    })
                    .sort(function(a,b){
                        return a.angle- b.angle;
                    });
                var optimalCamId = anglelist[0].cam;
                var view = kDict[optimalCamId];
                var axis = viewGeo.getPatchAxis(c, n, view);
                return photometrics.sampleRGB(c, axis[0], axis[1], pDict[optimalCamId], images[optimalCamId]);
            }

        });
}

//refinedColor();


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
testUtils.promiseSaveArrayBuffer('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/mvs/surfels.colors', arr.buffer);



//testPatchAxis();