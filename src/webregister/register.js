var _ = require('underscore');

var camUtils = require('../math/projections.js'),
    laUtils = require('../math/la-utils.js'),
    geoUtils = require('../math/geometry-utils.js'),
    shortcuts = require('../utils/shortcuts.js'),
    cord = require('../utils/cord.js'),
    triangulation = require('./triangulation.js'),
    estP = require('./estimate-projection'),
    sba = require('./sparse-bundle-adjustment.js');

var TRIANGULATION_CUTOFF = 0.2;
var TRACK_OUTLIER_CUTOFF = 0.8;

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
 * Robust Bundle Adjustment with oulier filter
 * @param {int[]} [cams]
 * @param {int[]} [points]
 * @returns {{ inliers: int[], outliers: int[] }}
 */
RegisterContext.prototype.robustAdjust = function(cams, points){

    cams = cams || _.keys(this.camDict).map(key2int);
    points = points || _.keys(this.xDict).map(key2int);

    var tracks = this.tracks;
    var ctx = this;
    var inliers = points.slice();
    var outliers = [];
    var filtered;

    do {

        ctx.adjust(cams, inliers);
        filtered = findOutliers();
        inliers = _.difference(inliers, filtered);
        outliers = outliers.concat(filtered);
        filtered.forEach(function(xi){ ctx.excludeTrack(xi); });
        console.log(filtered);
        console.log(filtered.length);

    } while (filtered.length>0);

    return { inliers: inliers, outliers: outliers };

    function findOutliers(){

        var cDict = ctx.camDict;
        var xDict = ctx.xDict;
        var pDict = _.mapObject(cDict, function(params){
            return camUtils.params2P(params);
        });
        var vDict = inliers.reduce(function(memo, xi){
            tracks[xi].forEach(function(view){
                var ci = view.cam,
                    rc = view.point;
                if (cams.indexOf(ci) !== -1) {
                    memo[ci].push({ xi: xi, rc: rc });
                }
            });
            return memo;
        }, _.mapObject(cDict, function(){ return []; }));


        return _.union.apply(null, cams.map(function(ci){
            return findCamOutliers(ci);
        }));

        function findCamOutliers(ci){

            var P = pDict[ci];

            /** @type {{ xi: int, error: number }[]} */
            var errorl = vDict[ci].map(function(entry){
                var xi = entry.xi,
                    rc = entry.rc,
                    X = xDict[xi],
                    x = P.x(X),
                    rc2 = cord.img2RC(x);
                return { xi: xi, error: geoUtils.getDistanceRC(rc, rc2) };
            });

            errorl.sort(function(l,r){ return l.error > r.error; });

            var d80 = errorl[Math.floor(errorl.length*TRACK_OUTLIER_CUTOFF)].error;

            function clamp(x, a, b){ return Math.min(Math.max(x,a),b); }

            var threshold = clamp(2.4*d80, 4, 16);

            console.log('d80: ' + d80);
            console.log('thresh: ' + threshold);

            return errorl.reduce(function(memo, entry){
                if (entry.error >= threshold) {
                    memo.push(entry.xi);
                }
                return memo;
            }, []);
        }

    }

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

        //console.log(maximum);

        if (maximum<TRIANGULATION_CUTOFF) { return; }

        var P1 = pDict[pair[0].ci];
        var P2 = pDict[pair[1].ci];
        var x1 = cord.rc2x(pair[0].rc);
        var x2 = cord.rc2x(pair[1].rc);

        xDict[xi] = triangulation(P1, P2, x1, x2);
        triangulated.push(xi);
        //console.log('triangulated one');
    });

    console.log('triangulated ' + triangulated.length);

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