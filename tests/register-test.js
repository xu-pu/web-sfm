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
    camUtils = require('../src/math/projections.js'),
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

var TRACKS_PATH = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/tracks.json';

var HALL_TRACKS_PATH = '/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/dev/tracks.json';

var CITYHALL_CAM_PATH = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/cams.json';
var CITYHALL_RAW_CAM_PATH = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/cams.raw.json';


var getCityCam = (function(){

    var cameras = require(CITYHALL_CAM_PATH);

    return function(i){

        var cam = _.find(cameras, function(entry){
            return entry.cam === i;
        }).camera;

        return {
            K: laUtils.toMatrix(cam.K),
            R: laUtils.toMatrix(cam.R),
            t: laUtils.toVector(cam.t)
        };
    }

})();

/**
 *
 * @param {int} i
 * @returns CameraParams
 */
function getCityCamParams(i){
    var model = getCityCam(i),
        K = model.K,
        R = model.R,
        t = model.t;
    return {
        r: geoUtils.getEulerAngles(R),
        t: t.elements,
        f: K.e(1,1), px: K.e(1,3), py: K.e(2,3),
        k1: 0, k2: 0
    };
}

function cityhalltest(i1, i2){

    var model1 = getCityCam(i1),
        model2 = getCityCam(i2),
        P1 = camUtils.model2P(model1),
        P2 = camUtils.model2P(model2),
        tracks = require(TRACKS_PATH),
        visiableTracks = tracking.viewedByN(tracks, [i1,i2]);

    console.log(visiableTracks.length);

    var sparse = visiableTracks.map(function(track){
        var x1, x2;
        track.forEach(function(view){
            if (view.cam === i1) {
                x1 = cord.rc2x(view.point);
            }
            else if (view.cam === i2) {
                x2 = cord.rc2x(view.point);
            }
        });
        return triangulation(P1, P2, x1, x2);
    });

    var reprojected1 = sparse.map(function(X){
        return cord.img2RC(P1.x(X));
    });

    var reprojected2 = sparse.map(function(X){
        return cord.img2RC(P2.x(X));
    });

    var reference1 = visiableTracks.map(function(track){
        return _.find(track, function(view){
            return view.cam === i1;
        }).point;
    });

    var reference2 = visiableTracks.map(function(track){
        return _.find(track, function(view){
            return view.cam === i2;
        }).point;
    });

    return Promise.all([
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-0.png', cityhalldemo.getImagePath(i1), reprojected1),
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-0-ref.png', cityhalldemo.getImagePath(i1), reference1),
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-1.png', cityhalldemo.getImagePath(i2), reprojected2),
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-1-ref.png', cityhalldemo.getImagePath(i2), reference2)
    ]);

}

cityhalltest(1,2);

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
            P0 = camUtils.getP(cp0),
            P1 = camUtils.getP(cp1);

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
        P0 = camUtils.getP(cp0),
        P1 = camUtils.getP(cp1);

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


