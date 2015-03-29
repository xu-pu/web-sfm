var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Plane = la.Plane,
    Line = la.Line;

var viewGeo = require('../src/webmvs/view-geometry.js'),
    sample = require('../src/utils/samples.js'),
    projection = require('../src/math/projections.js'),
    halldemo = require('../src/utils/demo-loader.js').halldemo;

function testPatchAxis(){
    var patch = halldemo.requireDense()[100];
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

    //console.log(c);
    console.log(axis);

//    sample.promiseImage(optimalCamId, true).then(function(img){
//
//    });


    //console.log(optimalCamId);
}

testPatchAxis();