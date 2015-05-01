var _ = require('underscore');

var camUtils = require('../math/projections.js'),
    laUtils = require('../math/la-utils.js'),
    shortcuts = require('../utils/shortcuts.js'),
    cord = require('../utils/cord.js'),
    triangulation = require('./triangulation.js'),
    estP = require('./estimate-projection'),
    sba = require('./sparse-bundle-adjustment.js');

var TRIANGULATION_CUTOFF = 0.2;

//============================================

exports.register = function(tracks, Fs){

};

//============================================

exports.RegisterContext = RegisterContext;

/**
 *
 * @param {Track[]} tracks
 * @constructor
 */
function RegisterContext(tracks){
    this.tracks = tracks;
    this.xDict = {};
    this.camDict = {};
    this.excluded = [];
}


/**
 *
 * @param {int} i
 * @param {CameraParams} c
 */
RegisterContext.prototype.addCamera = function(i, c){
    this.camDict[i] = c;
};


/**
 *
 * @param {int} i
 * @param {Vector} X
 */
RegisterContext.prototype.addPoint = function(i, X){
    this.xDict[i] = X;
};


/**
 *
 * @param {{ xi: int, X: Vector }[]} arr
 */
RegisterContext.prototype.addPointsArr = function(arr){
    var xDict = this.xDict;
    arr.forEach(function(entry){
        xDict[entry.xi] = entry.X;
    });
};


/**
 *
 * @param dict
 */
RegisterContext.prototype.addPointDict = function(dict){
    _.extend(this.xDict, dict);
};


/**
 *
 * @param {int} i
 */
RegisterContext.prototype.excludeTrack = function(i){
    delete this.xDict[i];
    var excluded = this.excluded;
    if (excluded.indexOf(i) === -1) {
        excluded.push(i);
    }
};


/**
 * Bundle Adjustment (global by default)
 * @param {int[]} [cams]
 * @param {int[]} [points]
 */
RegisterContext.prototype.adjust = function(cams, points){
    var tracks = this.tracks,
        camDict = this.camDict,
        xDict = this.xDict;
    cams = cams || _.keys(camDict).map(key2int);
    points = points || _.keys(xDict).map(key2int);
    sba.sba(camDict, xDict, tracks, cams, points);
};


/**
 *
 * @param {int[]} inds
 * @returns {int[]}
 */
RegisterContext.prototype.attemptTriangulation = function(inds){

    var tracks = this.tracks;
    var cDict = this.camDict; // CameraParams
    var xDict = this.xDict; // 4D Homogenous
    var mDict = _.mapObject(cDict, function(params){ return camUtils.params2model(params); }); // CameraModel
    var rDict = _.mapObject(mDict, function(model){ return camUtils.getPerspective(model.R, model.t).inverse(); }); // Reverse Perspective Transform Matrix
    var tDict = _.mapObject(mDict, function(model){ return camUtils.model2T(model); }); // T
    var pDict = _.mapObject(mDict, function(model){ return camUtils.model2P(model); }); // Projection Matrix

    var triangulated = [];

    /**
     * @typedef {{ rc: RowCol, ci: int, v: Vector }} Ray
     */

    inds.forEach(function(xi){

        var track = tracks[xi];

        /** @type {Ray[]} */
        var rays = track.reduce(function(memo, view){
            var ci = view.cam;
            if (cDict[ci]) {
                var X = rc2X(view.point, ci);
                var T = tDict[ci];
                memo.push({
                    rc: view.point,
                    ci: ci,
                    v: T.subtract(X)
                });
            }
            return memo;
        }, []);

        var maximum=-Infinity, pair=[];
        shortcuts.iterPairs(rays, function(ray1, ray2){
            var angle = ray1.v.angleFrom(ray2.v);
            if (angle>maximum) {
                maximum = angle;
                pair = [ray1, ray2];
            }
        });

        console.log(maximum);

        if (maximum<TRIANGULATION_CUTOFF) { return; }

        var P1 = pDict[pair[0].ci];
        var P2 = pDict[pair[1].ci];
        var x1 = cord.rc2x(pair[0].rc);
        var x2 = cord.rc2x(pair[1].rc);

        xDict[xi] = triangulation(P1, P2, x1, x2);
        triangulated.push(xi);
        console.log('triangulated one');
    });

    return triangulated;

    /**
     *
     * @param {RowCol} rc
     * @param {int} ci
     * @returns {Vector} -- 3D Hetero
     */
    function rc2X(rc, ci){
        /** @type {CameraParams} */
        var params = cDict[ci];
        var perspective = laUtils.toVector([ rc.col-params.px, rc.row-params.py, params.f, 1 ]);
        var X = rDict[ci].x(perspective);
        return cord.toInhomo3D(X);
    }


};


/**
 * @returns int[]
 */
RegisterContext.prototype.getRecoveredTrackInds = function(){
    return _.keys(this.xDict).map(key2int);
};

function key2int(key){ return parseInt(key, 10); }


//===============================================================

/**
 *
 * @param {int[]} camInds
 * @param {Track[]} tracks
 * @returns int[] - track ids
 */
exports.getCommonTracks = function(camInds, tracks){
    return tracks.reduce(function(memo, track, ind){
        var isVisAll = camInds.every(function(camInd){
            return track.some(function(view){
                return view.cam === camInd;
            });
        });
        if (isVisAll) {
            memo.push(ind);
        }
        return memo;
    }, []);
};