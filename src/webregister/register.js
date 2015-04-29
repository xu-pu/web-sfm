var _ = require('underscore');

var estP = require('./estimate-projection'),
    sba = require('./sparse-bundle-adjustment.js');

//============================================

exports.register = function(tracks, Fs){

};

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
 * @returns int[]
 */
RegisterContext.prototype.getRecoveredTrackInds = function(){
    return _.keys(this.xDict).map(key2int);
};

function key2int(key){ return parseInt(key, 10); }