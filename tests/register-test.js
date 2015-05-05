var _ = require('underscore'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric'),
    pool = require('ndarray-scratch'),
    ndarray = require('ndarray');

var os = require('os');

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

/*
cityhalldemo.promiseFullPointTable().then(function(table){
    var matchtable = cityhalldemo.loadRobustMatches();
    var tracks = tracking.track(matchtable, table);
    console.log(tracks.length);
    testUtils.promiseSaveJson(TRACKS_PATH, tracks);
});
*/
//var matchtable = cityhalldemo.loadRawMatches();
//console.log(matchtable.map(function(entry){
//    return entry.from + 'to' + entry.to;
//}));

//cityhalldemo.promiseSaveRawMatches({
//    from: 4,
//    to: 6,
//    matches: require('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/4to6.json')
//});

/*
function robustPair(i1, i2){
 var camshape = { height: 2048, width: 3072 };
    var ms = cityhalldemo.getRawMatches(i1,i2);
    cityhalldemo
        .promisePointTable([i1,i2])
        .then(function(table){
            var result = estF(ms.matches, {
                features1: table[i1],
                features2: table[i2],
                cam1: camshape, cam2: camshape
            });

            var entry = {
                from: i1,
                to: i2,
                matches: result.dataset,
                F: result.F.elements
            };

            console.log(entry);

            return cityhalldemo.promiseSaveRobustMatches(entry);

        });
}

robustPair(4,6);
*/


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

//registerContextTest([0,1,2,3,4,5,6]);

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

//genSparse();

function convertCam(i){

    var cams = require(SAVES_CAMS);

    var params = cams[i];
    var P = camUtils.params2P(params);
    var strr = getPString(P);
    console.log(strr);

    testUtils.promiseWriteFile('/home/sheep/Downloads/pmvs-2/data/cityhall/txt/0000000'+ i +'.txt', strr);

}

//_.range(7).forEach(function(i){
//    convertCam(i);
//});


function getPString(P){
    var arr = P.elements;
    return ['CONTOUR', arr[0].join(' '), arr[1].join(' '), arr[2].join(' ')].join(os.EOL) + os.EOL;

    function format(num){
        return num.toString().slice(0, 7);
    }
}

var PATCHES_PATH = '/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/dev/patches.json';
function genDense(){
    var dense = require(PATCHES_PATH);
    var length = dense.length;
    console.log(length);
    var varr = new Float32Array(length*3), carr = new Uint8Array(length*3);
    var nd = ndarray(varr, [length, 3]);
    dense.forEach(function(patch, i){
        var p = patch.point;
        nd.set(i, 0, p[0]/15);
        nd.set(i, 1, p[1]/15);
        nd.set(i, 2, p[2]/15);
    });

    return Promise.all([
        testUtils.promiseSaveArrayBuffer('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/mvs/surfels.points', varr.buffer)
    ]);

}

//genDense();

var hallshape = { height: 2000, width: 3000 };

function convertBundler(){

    var cams = sample.cameras;

    var cDict = cams.reduce(function(memo, cam, ci){

        var RR = laUtils.toMatrix(cam.R),
            tt = laUtils.toVector(cam.t),
            after = cord.getStandardRt(RR, tt),
            R = after.R,
            t = after.t;

        /** @type {StoredCamera} */
        memo[ci] = {
            r: geoUtils.getEulerAngles(R),
            t: t.elements,
            f: cam.focal,
            px: hallshape.width/2,
            py: hallshape.height/2,
            k1: 0, k2: 0,
            shape: hallshape
        };

        return memo;

    }, {});

    testUtils.promiseSaveJson('/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/cameras.json', cDict);

}

//convertBundler();


function convertCityhallCam(ratio){

    var camshape = { height: 2048, width: 3072 };

    var paramDict = require(SAVES_CAMS);

    var cDict = _.mapObject(paramDict, function(cam, ci){

        var model = camUtils.params2model(cam);

        var R = model.R,
            t = model.t;

        var T = camUtils.Rt2T(R, t);
        var TT = T.x(ratio);
        var tt = camUtils.RT2t(R, TT);


        /** @type {StoredCamera} */
        return {
            r: geoUtils.getEulerAngles(R),
            t: tt.elements,
            f: cam.f,
            px: cam.px,
            py: cam.py,
            k1: 0, k2: 0,
            shape: camshape
        };

    });

    testUtils.promiseSaveJson('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/cameras.json', cDict);

}

//convertCityhallCam(1/15);

//halldemo.genThumbnails();
/*
 var ctx = new RegisterContext(require(TRACKS_PATH));
console.log(ctx.cams);
console.log(ctx.tracksLeft.length);
console.log(ctx.tracks.length);
console.log(_.values(ctx.visDict).map(function(l){ return l.length; }));
*/

var CAM_VIS_THRESHOLD = 0.75;

function tryIncreamental(ci1, ci2){

    var sDict = cityhalldemo.sDict;

    var ctx = new RegisterContext(require(TRACKS_PATH), sDict);

    ctx.addCamera(ci1, getCityCamParams(ci1));
    ctx.addCamera(ci2, getCityCamParams(ci2));
    ctx.attemptTriangulation(_.union(ctx.visDict[ci1], ctx.visDict[ci2]));
    console.log(_.keys(ctx.xDict).length);
    ctx.robustAdjust();
    console.log(_.keys(ctx.xDict).length);

    var camsLeft = _.difference(ctx.cams, _.keys(ctx.camDict).map(key2int));
    var xs = _.keys(ctx.xDict).map(key2int);

    var maxci, maxcount = -Infinity;
    var resssdict = {};
    camsLeft.forEach(function(ci){
        var vislist = ctx.visDict[ci];
        var visiables = _.intersection(xs, vislist);
        var count = visiables.length;
        if (count > maxcount) {
            maxci = ci;
            maxcount = count;
        }
        resssdict[ci] = visiables;
    });

    camsLeft.forEach(function(ci){
        if (resssdict[ci].length < CAM_VIS_THRESHOLD*maxcount) {
            delete resssdict[ci];
        }
    });

    _.each(resssdict, function(value, key){
        var ci  = key2int(key);
        var shape = sDict[ci];
        var cors = value.map(function(xi){
            var X = ctx.xDict[xi];
            var view = _.find(ctx.tracks[xi], function(view){
                return view.cam === ci;
            });
            var x = cord.rc2x(view.point);
            return { X: X, x: x };
        });
        var param = dlt.getRobustCameraParams(cors, shape);
        console.log(param);
        ctx.addCamera(ci, param);
    });

    var newcams = _.keys(resssdict).map(key2int);

//    ctx.adjust(_.keys(resssdict).map(key2int), []);


//    _.each(resssdict, function(value, key){
//        var ci  = key2int(key);
//        console.log(ctx.camDict[ci]);
//    });

    var visvis = _.union.apply(null, _.values(resssdict));
    console.log(_.keys(resssdict));
    console.log(visvis.length);

    ctx.adjust(newcams, visvis);

    _.each(resssdict, function(value, key){
        var ci  = key2int(key);
        console.log(ctx.camDict[ci]);
    });

    /*

     ctx.robustAdjust();

    _.each(resssdict, function(value, key){
        var ci  = key2int(key);
        console.log(ctx.camDict[ci]);
    });
*/

}

function key2int(key){ return parseInt(key, 10); }

tryIncreamental(0,1);