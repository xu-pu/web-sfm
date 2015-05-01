var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric'),
    pool = require('ndarray-scratch'),
    ndarray = require('ndarray');

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
    lma = require('../src/math/nonlinear.js').lma,
    estF = require('../src/webregister/estimate-fmatrix.js'),
    laUtils = require('../src/math/la-utils.js'),
    geoUtils = require('../src/math/geometry-utils.js'),
    extUtils = require('../src/utils/external-utils.js'),
    decomposition = require('../src/math/matrix-decomposition.js'),
    triangulation = require('../src/webregister/triangulation.js'),
    register = require('../src/webregister/register.js'),
    sba = require('../src/webregister/sparse-bundle-adjustment.js'),
    RegisterContext = register.RegisterContext;



var CAM_PARAMS = 11; // 3*r, 3*t, f,px,py, k1,k2

var TRACKS_PATH = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/tracks.json';

var HALL_TRACKS_PATH = '/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/dev/tracks.json';

var CITYHALL_CAM_PATH = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/cams.json';
var CITYHALL_RAW_CAM_PATH = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/cams.raw.json';
var SBA_TEST_DATA = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/sba.test.json';

var SAVES_SPARSE = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/optimized-sparse.json';
var SAVES_CAMS = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/optimized-cams.json';

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


var VISUAL_BASE = '/home/sheep/Code';

//console.log(require(HALL_TRACKS_PATH));

function registerContextTest(cams){

    var tracks = require(TRACKS_PATH);

    var ctx = new RegisterContext(tracks);
    cams.forEach(function(ci){
        ctx.addCamera(ci, getCityCamParams(ci));
    });

    ctx.attemptTriangulation(_.range(tracks.length));

    //ctx.adjust();

    ctx.robustAdjust();

    var xDict = ctx.xDict,
        camDict = ctx.camDict;

    testUtils.promiseSaveJson(SAVES_SPARSE, _.reduce(xDict, function(memo, X, xi){
        memo.push(cord.toInhomo3D(X).elements);
        return memo;
    }, []));

    testUtils.promiseSaveJson(SAVES_CAMS, camDict);

    return Promise.all(cams.map(function(ci){
        var P = camUtils.params2P(camDict[ci]);
        var reprojected = [], refer = [];
        tracks.forEach(function(track, xi){
            var X = xDict[xi];
            if (X) {
                var visiable = track.some(function(view){
                    if (view.cam === ci) {
                        refer.push(view.point);
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if (visiable) {
                    reprojected.push(cord.img2RC(P.x(X)));
                }
            }
        });

        return Promise.all([
            testUtils.promiseVisualPoints(VISUAL_BASE + '/register.' + ci + '.refer.png', cityhalldemo.getImagePath(ci), refer),
            testUtils.promiseVisualPoints(VISUAL_BASE + '/register.' + ci + '.after.png', cityhalldemo.getImagePath(ci), reprojected)
        ]);

    }));

}

//registerContextTest([0,1,2,3,4,6]);

function genSparse(){
    var sparse = require(SAVES_SPARSE);
    var length = sparse.length;
    var vbuffer = new Float32Array(length*3);
    var cbuffer = new Uint8Array(length*3);
    var nd = ndarray(vbuffer, [length, 3]);
    sparse.forEach(function(p, i){
        nd.set(i, 0, p[0]/10);
        nd.set(i, 1, p[1]/10);
        nd.set(i, 2, p[2]/10);
    });
    return Promise.all([
        testUtils.promiseSaveJson('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/calibration/cameras.json', []),
        testUtils.promiseSaveArrayBuffer('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/calibration/sparse.points', vbuffer.buffer),
        testUtils.promiseSaveArrayBuffer('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/calibration/sparse.colors', cbuffer.buffer)
    ]);
}

genSparse();