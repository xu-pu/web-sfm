var _ = require('underscore');

var lma = require('../math/levenberg-marquardt.js'),
    estP = require('./estimate-projection');

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
}


/**
 * @returns int[]
 */
RegisterContext.prototype.getRecoveredTrackInds = function(){
    return _.keys(this.xDict)
        .map(function(keyStr){
            return parseInt(keyStr, 10);
        });
};