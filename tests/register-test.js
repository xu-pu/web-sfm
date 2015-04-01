var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric'),
    pool = require('ndarray-scratch');

var sample = require('../src/utils/samples.js'),
    matcher = require('../src/webmatcher/matcher.js'),
    halldemo = require('../src/utils/demo-loader.js').halldemo,
    cityhalldemo = require('../src/utils/demo-loader.js').cityhalldemo,
    cometdemo = require('../src/utils/demo-loader.js').cometdemo,
    tracking = require('../src/webmatcher/tracking.js'),
    VisibilityGraph = require('../src/webmatcher/tracking.js').VisibilityGraph,
    testing = require('../src/utils/testing.js'),
    testUtils = require('../src/utils/test-utils.js'),
    imgUtils = require('../src/utils/image-conversion.js'),
    projections = require('../src/math/projections.js'),
    cord = require('../src/utils/cord.js'),
    dlt = require('../src/webregister/estimate-projection.js'),
    lma = require('../src/math/levenberg-marquardt.js'),
    laUtils = require('../src/math/la-utils.js'),
    geoUtils = require('../src/math/geometry-utils.js'),
    extUtils = require('../src/utils/external-utils.js'),
    decomposition = require('../src/math/matrix-decomposition.js'),
    triangulation = require('../src/webregister/triangulation.js');

function decView(i){
    var view = sample.getView(i),
        P = view.P,
        R = view.R,
        t = view.t,
        cam = view.cam,
        K = projections.getCalibrationMatrix(view.f, cam.width, cam.height);

    var results = decomposition.KRt(P),
        KKK = results.K,
        RRR = results.R,
        ttt = results.t;

    console.log(R.transpose().x(RRR).subtract(Matrix.I(3)).max());
    console.log(R.subtract(RRR).max());
    console.log(KKK.subtract(K).max());
    console.log(t.subtract(ttt).max());

}

Promise.all([
    cityhalldemo.promiseVectorBuffer(0),
    cityhalldemo.promiseVectorBuffer(1)
]).then(function(results){
    var ms = matcher.match(results[0], results[1]);
    return testUtils.promiseSaveJson('/home/sheep/Code/cityhall.json', ms);
});

//decView(30);

//cometdemo.genLoweSift(9);

/*
testUtils
    .promiseImage('/home/sheep/Code/Project/web-sfm/demo/Rosetta-Spacecraft/images/Comet_on_19_September_2014_NavCam.jpg')
    .then(function(img){
        testUtils.promiseSaveNdarray('/home/sheep/Code/Project/web-sfm/demo/Rosetta-Spacecraft/images/Comet_on_19_September_2014_NavCam.half.png', imgUtils.getDownsample(img));
    });
*/
/*
halldemo
    .promisePointTable([1,3,5,7,9])
    .then(function(pointTable){
        var matchtable = [
            [1,3],
            [3,5],
            [5,7],
            [7,9]]
            .map(function(pair){
                return halldemo.getRobustMatches(pair[0], pair[1]);
            });
        var tracks = tracking.track(matchtable, pointTable);
        var visibility = new VisibilityGraph(tracks);
        console.log(tracks.length);
        console.log(_.keys(visibility.cams));
        console.log(_.intersection(visibility.cams[1], visibility.cams[3]).length);

        var ci1 = 1, ci2 = 3;
        var cam1 = sample.getView(ci1);
        var cam2 = sample.getView(ci2);
        var selected = _.intersection(visibility.cams[ci1], visibility.cams[ci2]);
        var triangulated = selected.map(function(ti){
            var track = tracks[ti];
            var view1 = _.find(track, function(view){ return view.cam === ci1; }),
                view2 = _.find(track, function(view){ return view.cam === ci2; }),
                x1 = cord.rc2x(view1.point),
                x2 = cord.rc2x(view2.point);
            return triangulation(cam1.P, cam2.P, x1, x2);
        });

        var recovered = [];
        selected.forEach(function(trackIndex, i){
            recovered[trackIndex] = triangulated[i];
        });

        var thirdCam = 7;

        var anchors = _.intersection(selected, visibility.cams[thirdCam]);

        var rcs = anchors.map(function(i){
                return _.find(tracks[i], function(v){
                    return v.cam === thirdCam;
                }).point;
            });

        var dataset = anchors.map(function(anc, i){
            var X = recovered[anc];
            var x = cord.rc2x(rcs[i]);
            return { X: X, x: x };
        });

        var ested = dlt(dataset);

        var points1 = triangulated.map(function(X){
            return cord.img2RC(cam1.P.x(X));
        });
        var points2 = triangulated.map(function(X){
            return cord.img2RC(cam2.P.x(X));
        });

        var points3 = dataset.map(function(pair){
            return cord.img2RC(ested.x(pair.X));
        });

        var ref = sample.getView(thirdCam);
        var results = decomposition.KRt(ested),
            R = results.R,
            t = results.t,
            K = results.K,
            ratio = 1/ K.e(3,3);

        if (results.R.det() < 0) {
            R = R.x(-1);
            t = t.x(-1);
        }

        console.log(R.det());
//        console.log(ref.R.x(R.transpose()));
//        console.log(ref.t.subtract(t));

        console.log(geoUtils.getEulerAngles(R));
        console.log(geoUtils.getEulerAngles(ref.R));

        return Promise.all([
            testing.promiseVisualPoints('/home/sheep/Code/triangulation-1.png', ci1, points1),
            testing.promiseVisualPoints('/home/sheep/Code/triangulation-2.png', ci2, points2),
            testing.promiseVisualPoints('/home/sheep/Code/triangulation-3.png', thirdCam, points3)
        ]);


    });
*/