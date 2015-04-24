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
var SBA_TEST_DATA = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/sba.test.json';

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

function sbaTest(i1, i2){

    var dataset = require(SBA_TEST_DATA),
        camDict = dataset.cameras,
        tracks = dataset.tracks,
        points = dataset.points;

    var params1 = camDict[i1],
        params2 = camDict[i2],
        P1 = camUtils.params2P(params1),
        P2 = camUtils.params2P(params2);

    var xDict = points.reduce(function(memo, arr, i){
        memo[i] = laUtils.toVector(arr);
        return memo;
    }, {});

    sba.sba(camDict, xDict, tracks, [i1, i2], _.range(tracks.length));

    var sparse = points.map(function(X){
        return laUtils.toVector(X.concat([1]));
    });

    var reprojected1 = sparse.map(function(X){
            return cord.img2RC(P1.x(X));
        }),
        reprojected2 = sparse.map(function(X){
            return cord.img2RC(P2.x(X));
        }),
        reference1 = tracks.map(function(track){
            return _.find(track, function(view){
                return view.cam === i1;
            }).point;
        }),
        reference2 = tracks.map(function(track){
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

sbaTest(1,2);


function refineTest(i1, i2){

    var param1 = getCityCamParams(i1),
        param2 = getCityCamParams(i2),
        tracks = tracking.viewedByN(require(TRACKS_PATH), [i1,i2]);

    var flat1 = camUtils.flattenCameraParams(param1),
        flat2 = camUtils.flattenCameraParams(param2),
        x0 = laUtils.toVector(flat1.concat(flat2)),
        selectedIndex = _.sample(_.range(tracks.length), 100),
        vislist = sba.getVisList(tracks, [i1, i2], selectedIndex);

    var refined = lma(function(xn){
        var cams = sba.spliteParams(xn.elements, 2).cams,
            inflated1 = camUtils.inflateCameraParams(cams[0]),
            inflated2 = camUtils.inflateCameraParams(cams[1]),
            P1 = camUtils.params2P(inflated1),
            P2 = camUtils.params2P(inflated2),
            cDict = {};

        cDict[i1] = P1;
        cDict[i2] = P2;

        var xDict = {};
        selectedIndex.map(function(ind){
            var track = tracks[ind];
            var x1, x2;
            track.forEach(function(view){
                if (view.cam === i1) {
                    x1 = cord.rc2x(view.point);
                }
                else if (view.cam === i2) {
                    x2 = cord.rc2x(view.point);
                }
            });
            xDict[ind] = triangulation(P1, P2, x1, x2);
        });

        return laUtils.toVector(vislist.map(function(entry){
            var rc = entry.rc,
                ci = entry.ci,
                xi = entry.xi;
            var P = cDict[ci];
            var X = xDict[xi];
            return geoUtils.getDistanceRC(rc, cord.img2RC(P.x(X)));
        }));

    }, x0, Vector.Zero(vislist.length));

    var cams = sba.spliteParams(refined.elements, 2).cams,
        inflated1 = camUtils.inflateCameraParams(cams[0]),
        inflated2 = camUtils.inflateCameraParams(cams[1]),
        P1 = camUtils.params2P(inflated1),
        P2 = camUtils.params2P(inflated2);

    var sparse = tracks.map(function(track){
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
        }),
        reprojected2 = sparse.map(function(X){
            return cord.img2RC(P2.x(X));
        }),
        reference1 = tracks.map(function(track){
            return _.find(track, function(view){
                return view.cam === i1;
            }).point;
        }),
        reference2 = tracks.map(function(track){
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

//refineTest(1,3);

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

//cityhalltest(1,2);