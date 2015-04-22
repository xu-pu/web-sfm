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


function camParamTest(i){

    var camParam = sample.getCameraParams(i);
    var sparse = sample.getViewSparse(i);

    var model = camUtils.params2model(camParam);
    var P = camUtils.model2P(model);

    var reprojected = sparse.map(function(pair){
        return cord.img2RC(P.x(pair.X));
    });

    var reference = sparse.map(function(pair){
        return pair.x;
    });

    return Promise.all([
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-0.png', sample.getImagePath(i), reference),
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-1.png', sample.getImagePath(i), reprojected)
    ]);

}

//camParamTest(4);

function camPairTest(i1, i2){

    var tracks = require(HALL_TRACKS_PATH);
    var visiableTracks = tracking.viewedByN(tracks, [i1, i2]);

    var cam1 = sample.getCameraParams(i1),
        cam2 = sample.getCameraParams(i2);

    var params1 = camUtils.flattenCameraParams(cam1),
        params2 = camUtils.flattenCameraParams(cam2);

    var refinedCam1 = camUtils.inflateCameraParams(params1),
        refinedCam2 = camUtils.inflateCameraParams(params2);

    var P1 = camUtils.getP(refinedCam1),
        P2 = camUtils.getP(refinedCam2);

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
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-0.png', sample.getImagePath(i1), reprojected1),
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-0-ref.png', sample.getImagePath(i1), reference1),
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-1.png', sample.getImagePath(i2), reprojected2),
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-1-ref.png', sample.getImagePath(i2), reference2)
    ]);

}


//camPairTest(1,5);

/*
halldemo
    .promisePointTable([1,3,5,7,9])
    .then(function(pointTable){
        var matchTable = halldemo.loadRobustMatches(),
            tracks = tracking.track(matchTable, pointTable);
        console.log(tracks.length);
        testUtils.promiseSaveJson(HALL_TRACKS_PATH, tracks);
    });
*/


var rawInputs = [

    {
        cam: 0,
        camera: {
            K: [[ 3954.7557192818421754, -8.7442247413155467228, 1619.9232700857789951],
                [ 0                    , 3948.0083629740670403 , 1151.4558912976590364],
                [ 0                    , 0                     , 1                    ]],
            R: [[ 0.20375937643691741097, -0.69053558615975718649, -0.69400484202996670646 ],
                [ 0.96826741623780387958,  0.24691758860300769274,  0.038599418268196600268],
                [ 0.14470773015359589264, -0.67984726864603672869,  0.71893488171622177418 ]],
            T: [60.918680827294920732, -11.639521657550879752, -35.710742416854976966]
        }
    },

    {
        cam: 1,
        camera: {
            K: [[ 3954.7557192818421754, -8.7442247413155467228, 1619.9232700857789951],
                [ 0                    , 3948.0083629740670403 , 1151.4558912976590364],
                [ 0                    , 0                     , 1                    ]],
            R: [[0.080785727185740188738, -0.70814018777099718704, -0.70143505811067630162],
                [0.9726649564893224964, 0.20972021320435788039, -0.099701126328357494999],
                [0.21770748425512520541, -0.67420687228563269677, 0.70572554485588023798]],
            T: [ 63.828350514082373479, 17.013558100248708627, -29.739881418380420541]
        }
    },

    {
        cam: 2,
        camera: {
            K: [[ 3954.7557192818421754, -8.7442247413155467228, 1619.9232700857789951],
                [ 0                    , 3948.0083629740670403 , 1151.4558912976590364],
                [ 0                    , 0                     , 1                    ]],
            R: [[ 0.0063066391879999144157, -0.74747745195504688986, -0.66425724318289747217],
                [ 0.97408944863715607454  , 0.15477013649059342959 , -0.16491194894380595271],
                [ 0.22607514758573918345  , -0.64600593160548747118, 0.7290859784515215658  ]],
            T: [38.478189569357461153, 31.505172358244671216, -14.553250098048570393]
        }
    },

    {
        cam: 3,
        camera: {
            K: [[ 3954.7557192818421754, -8.7442247413155467228, 1619.9232700857789951],
                [ 0                    , 3948.0083629740670403 , 1151.4558912976590364],
                [ 0                    , 0                     , 1                    ]],
            R: [[ 0.18592098793639647014, -0.79750270467119177553, -0.57395367608099534529  ],
                [ 0.97327531992341176359, 0.229610439794783322   , -0.0037679656615760260228],
                [ 0.13479071879300499881, -0.55791440381063828191, 0.81887909983579687534   ]],
            T: [ 16.365091780754749351, 3.7511579736175399979, -10.30459705958094041 ]
        }
    },

    {
        cam: 4,
        camera: {
            K: [[ 3954.7557192818421754, -8.7442247413155467228, 1619.9232700857789951],
                [ 0                    , 3948.0083629740670403 , 1151.4558912976590364],
                [ 0                    , 0                     , 1                    ]],
            R: [[ 0.17792064656002049006, -0.87024390164831100236, -0.45936890967020083121 ],
                [ 0.97505913964908075275, 0.21884945558136331689 , -0.036940357043961598305],
                [ 0.13267975623454669742, -0.44133940163514262522, 0.88747710666240597899  ]],
            T: [-3.8412601284593561601, 1.2295801838540059148, -0.4803404109674324074]
        }
    },

    {
        cam: 5,
        camera: {
            K: [[ 3954.7557192818421754, -8.7442247413155467228, 1619.9232700857789951],
                [ 0                    , 3948.0083629740670403 , 1151.4558912976590364],
                [ 0                    , 0                     , 1                    ]],
            R: [[ -0.1929547287383426013, -0.89099708592736670543 , -0.41096552839192418416],
                [ 0.92757169662164618007, -0.029056258770658552337, -0.37251373324039127599],
                [ 0.31996753004633687878, -0.45307827877221540369 , 0.83207022120783369346 ]],
            T: [-12.174885011595449669, 27.882231883621049207, 9.7332614647944133424]
        }
    },

    {
        cam: 6,
        camera: {
            K: [[ 3954.7557192818421754, -8.7442247413155467228, 1619.9232700857789951 ],
                [ 0                    , 3948.0083629740670403 , 1151.4558912976590364 ],
                [ 0                    , 0                     , 1                     ]],
            R: [[-0.30527795485167169565, -0.84947554571025629677, -0.43034482397473189375],
                [0.89616983490167578807, -0.10347157492983269367, -0.43147799502853356746],
                [0.32200154858926366419, -0.51738276973803665193, 0.79286195033203210603]],
            T: [ -20.00000215925766156, 41.749768426134636456, 15.975352946694389544 ]
        }
    }

];


var convertedCams = rawInputs.map(function(entry){
    var camID = entry.cam;
    var camera = entry.camera;
    var RR = laUtils.toMatrix(camera.R);
    var T = laUtils.toVector(camera.T);
    var R = RR.transpose();
    var t = R.x(T).x(-1);
    return {
        cam: camID,
        camera: {
            K: camera.K,
            R: R.elements,
            t: t.elements
        }
    };
});

testUtils.promiseSaveJson(CITYHALL_CAM_PATH, convertedCams);

function cityhalltest(){
    var tracks = require(TRACKS_PATH);
    var visiableTracks = tracking.viewedByN(tracks, [0,1]);
    var P0 = camUtils.model2P(ccc0);
    var P1 = camUtils.model2P(ccc1);
    var sparse = visiableTracks.map(function(track){
        var x0, x1;
        track.forEach(function(view){
            if (view.cam === 0) {
                x0 = cord.rc2x(view.point);
            }
            else if (view.cam === 1) {
                x1 = cord.rc2x(view.point);
            }
        });
        return triangulation(P0, P1, x0, x1);
    });

    var reprojected0 = sparse.map(function(X){
        return cord.img2RC(P0.x(X));
    });

    var reprojected1 = sparse.map(function(X){
        return cord.img2RC(P1.x(X));
    });

    var reference0 = visiableTracks.map(function(track){
        return _.find(track, function(view){
            return view.cam === 0;
        }).point;
    });

    var reference1 = visiableTracks.map(function(track){
        return _.find(track, function(view){
            return view.cam === 1;
        }).point;
    });

    return Promise.all([
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-0.png', cityhalldemo.getImagePath(0), reprojected0),
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-0-ref.png', cityhalldemo.getImagePath(0), reference0),
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-1.png', cityhalldemo.getImagePath(1), reprojected1),
        testUtils.promiseVisualPoints('/home/sheep/Code/params-test-1-ref.png', cityhalldemo.getImagePath(1), reference1)
    ]);

}

//cityhalltest();


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


