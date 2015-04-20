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
    estF = require('../src/webregister/estimate-fmatrix.js'),
    laUtils = require('../src/math/la-utils.js'),
    geoUtils = require('../src/math/geometry-utils.js'),
    extUtils = require('../src/utils/external-utils.js'),
    decomposition = require('../src/math/matrix-decomposition.js'),
    triangulation = require('../src/webregister/triangulation.js'),
    register = require('../src/webregister/register.js'),
    sba = require('../src/math/sparse-bundle-adjustment.js'),
    RegisterContext = register.RegisterContext;



var CAM_PARAMS = 11; // 3*r, 3*t, f,px,py, k1,k2

var TRACKS_PATH = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/tracks.json';

/*
var focal0 = 3950,
    px0 = 1619.9232700857789951,
    py0 = 1151.4558912976590364,
    R0 = [
        [ 0.20375937643691741097, -0.69053558615975718649, -0.69400484202996670646 ],
        [ 0.96826741623780387958,  0.24691758860300769274,  0.038599418268196600268],
        [ 0.14470773015359589264, -0.67984726864603672869,  0.71893488171622177418 ]
    ],
    t0 = [60.918680827294920732, -11.639521657550879752, -35.710742416854976966];

var focal1 = 3950,
    px1 = 1619.9232700857789951,
    py1 = 1151.4558912976590364,
    R1 = [
        [0.080785727185740188738, -0.70814018777099718704, -0.70143505811067630162],
        [0.9726649564893224964, 0.20972021320435788039, -0.099701126328357494999],
        [0.21770748425512520541, -0.67420687228563269677, 0.70572554485588023798]
    ],
    t1 = [ 63.828350514082373479, 17.013558100248708627, -29.739881418380420541];
*/

var R0 = [
        [ 0.20375937643691741097, -0.69053558615975718649, -0.69400484202996670646 ],
        [ 0.96826741623780387958,  0.24691758860300769274,  0.038599418268196600268],
        [ 0.14470773015359589264, -0.67984726864603672869,  0.71893488171622177418 ]
    ],
    R1 = [
        [0.080785727185740188738, -0.70814018777099718704, -0.70143505811067630162],
        [0.9726649564893224964, 0.20972021320435788039, -0.099701126328357494999],
        [0.21770748425512520541, -0.67420687228563269677, 0.70572554485588023798]
    ];

var camParam0 = {
    r: geoUtils.getEulerAngles(Matrix.create(R0)),
    t: [60.918680827294920732, -11.639521657550879752, -35.710742416854976966],
    f: 3950,
//    px: 1619.9232700857789951,
//    py: 1151.4558912976590364,
    px: 1536,
    py: 1024,
    k1: 0, k2: 0
};
var camParam1 = {
    r: geoUtils.getEulerAngles(Matrix.create(R1)),
    t: [ 63.828350514082373479, 17.013558100248708627, -29.739881418380420541],
    f: 3950,
//    px: 1619.9232700857789951,
//    py: 1151.4558912976590364,
    px: 1536,
    py: 1024,
    k1: 0, k2: 0
};


function hallvari(i1, i2){

    var cam1 = sample.getView(i1),
        cam2 = sample.getView(i2);
    var sparse = sample.getTwoViewSparse(i1, i2);
    var cp1 = {
//            r, t, f, px, py, k1: 0, k2: 0
        },
        cp2 = {
//            r, t, f, px, py, k1, k2
        };

}


function registerTest(){

    var tracks = require(TRACKS_PATH);
    var visibles = register.getCommonTracks([0,1], tracks);

    //====================================

    var params0 = sba.flattenCamera(camParam0).concat(sba.flattenCamera(camParam1));

    var selected = _.sample(visibles, 50), // id
        vislist = sba.getVisList(tracks, [0,1], selected);

    var factor = 0.00001;

    var results = lma(function(x){

        var params = x.x(1/factor).elements,
            cp0 = sba.inflateCamera(params.slice(0, CAM_PARAMS)),
            cp1 = sba.inflateCamera(params.slice(CAM_PARAMS)),
            P0 = projections.getP(cp0),
            P1 = projections.getP(cp1);

        var proDict = {
            0: sba.getProjection(cp0),
            1: sba.getProjection(cp1)
        };

        var xDict = {};

        selected.forEach(function(trackID){
            var track = tracks[trackID];
            var x0 = cord.rc2x(_.find(track, function(view){
                return view.cam === 0;
            }).point);
            var x1 = cord.rc2x(_.find(track, function(view){
                return view.cam === 1;
            }).point);
            xDict[trackID] = cord.toInhomo3D(triangulation(P0, P1, x0, x1));
        });

        var errorArr = vislist.map(function(vis){
            var ci = vis.ci,
                xi = vis.xi,
                rc = vis.rc,
                proj = proDict[ci],
                X = xDict[xi],
                x = proj(X);
            return geoUtils.getDistanceRC(rc, cord.img2RC(x));
        });

        console.log('one round');

        return laUtils.toVector(errorArr);

    }, laUtils.toVector(params0).x(factor), Vector.Zero(vislist.length)).x(1/factor);

    var params = results.elements,
        cp0 = sba.inflateCamera(params.slice(0, CAM_PARAMS)),
        cp1 = sba.inflateCamera(params.slice(CAM_PARAMS)),
        P0 = projections.getP(cp0),
        P1 = projections.getP(cp1);

    var proDict = {
        0: sba.getProjection(cp0),
        1: sba.getProjection(cp1)
    };

    var xDict = {};

    visibles.forEach(function(trackID){
        var track = tracks[trackID];
        var x0 = cord.rc2x(_.find(track, function(view){
            return view.cam === 0;
        }).point);
        var x1 = cord.rc2x(_.find(track, function(view){
            return view.cam === 1;
        }).point);
        xDict[trackID] = cord.toInhomo3D(triangulation(P0, P1, x0, x1));
    });

    var Xs = _.values(xDict);

    var rc0 = Xs.map(function(X){
        return cord.img2RC(proDict[0](X));
    });

    var rc1 = Xs.map(function(X){
        return cord.img2RC(proDict[1](X));
    });

    var rc00 = visibles.map(function(trackID){
        var track = tracks[trackID];
        return _.find(track, function(view){
            return view.cam === 0;
        }).point;
    });

    var rc11 = visibles.map(function(trackID){
        var track = tracks[trackID];
        return _.find(track, function(view){
            return view.cam === 1;
        }).point;
    });



    return Promise.all([
        testUtils.promiseVisualPoints('/home/sheep/Code/tri-test-0.png', cityhalldemo.getImagePath(0), rc0),
        testUtils.promiseVisualPoints('/home/sheep/Code/tri-test-1.png', cityhalldemo.getImagePath(1), rc1),
        testUtils.promiseVisualPoints('/home/sheep/Code/tri-test-00.png', cityhalldemo.getImagePath(0), rc00),
        testUtils.promiseVisualPoints('/home/sheep/Code/tri-test-11.png', cityhalldemo.getImagePath(1), rc11)
    ]);

}
//registerTest();

function tracksTest(){
    var matchTable = cityhalldemo.loadRobustMatches();
    cityhalldemo
        .promiseFullPointTable()
        .then(function(pointTable){
            var tracks = tracking.track(matchTable, pointTable);
            console.log(tracks.length);
            console.log(tracks[50]);
            return testUtils.promiseSaveJson(TRACKS_PATH, tracks);
        });

}

//tracksTest();

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

function robustPair(i1,i2){
    Promise.all([
        cityhalldemo.promisePointsBuffer(i1),
        cityhalldemo.promisePointsBuffer(i2)
    ]).then(function(res){
        var features1 = res[0],
            features2 = res[1],
            path1 = cityhalldemo.getImagePath(i1),
            path2 = cityhalldemo.getImagePath(i2),
            cam1 = cityhalldemo.getCam(i1),
            cam2 = cityhalldemo.getCam(i2),
            matches = cityhalldemo.getRawMatches(i1, i2).matches;
        var results = estF(matches, {
            features1: features1,
            features2: features2,
            cam1: cam1,
            cam2: cam2
        });

        var F = laUtils.normalizedMatrix(results.F);

        return Promise.all([
            cityhalldemo.promiseSaveRobustMatches({ from: i1, to: i2, matches: results.dataset, F: F.elements }),
            testUtils.promiseDetailedMatches('/home/sheep/Code/cityhall.png', path1, path2, features1, features2, _.sample(results.dataset, 50), F)
        ]);
    });
}

//halldemo.genImageJson();

//robustPair(5,6);

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



