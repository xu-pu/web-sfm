'use strict';


if (typeof SFM === 'undefined') {
    var SFM = {};
}


SFM.TRACK_THRESHOLD = 2;
SFM.ANN_THRESHOLD = 0.6;
SFM.FMATRIX_ERROR_THRESHOLD = 1;
SFM.MATCH_OUTLIER_THRESHOLD = 0.006;


/**
 * @param {Object[]} options.dataset
 * @param {number} options.outlierThreshold
 * @param {int} options.trials
 * @param options.metadata -- passed to the relGenerator
 * @param {function} options.relGenerator
 * @param {function} options.errorGenerator
 * @param {number} options.errorThreshold
 * @param {int} options.subset
 * @return {{dataset: [], rel}}
 */
SFM.ransac = function(options){
    var relEsitmate, inliers, trials=options.trials;
    while(trials !== 0){
        relEsitmate = SFM.eightPoint(_.sample(options.dataset, options.subset), options.metadata);
        inliers = _.filter(options.dataset, function(m){
            return options.errorGenerator(relEsitmate, m, options.metadata) < options.errorThreshold;
        });
        if (inliers.length/options.dataset.length >= 1-options.outlierThreshold) {
            console.log('return');
            console.log(options.trials-trials);
            console.log(inliers.length/options.dataset.length);
            return { dataset: inliers, rel: relEsitmate };
        }
        console.log('tried once');
        console.log(inliers.length/options.dataset.length);
        trials--;
    }
    throw "RANSAC faild";
};


SFM.twoViewMatch = function(features1, features2, ANN_THRESHOLD){
    var matches = [];
    _.forEach(features1, function(f1, index1){
        var match1=0, match2=0, diff1=Infinity, diff2=Infinity;
        _.forEach(features2, function(f2, index2){
            var diff = numeric.norm2(numeric.sub(f1.vector, f2.vector));
            if (diff<diff1){
                match2 = match1;
                diff2 = diff1;
                match1 = index2;
                diff1 = diff;
            }
            else if (diff>diff1 && diff<diff2) {
                match2 = index2;
                diff2 = diff;
            }
        });
        if (diff1/diff2 < ANN_THRESHOLD) {
            matches.push([index1, match1]);
        }
    });
    return matches;
};

/**
 * @param {TwoViewMatches[]} matchList
 * @returns {Track[]}
 */
SFM.findTracks = function(matchList) {
    var tracks = [];
    matchList.forEach(function(match){
        tracks = SFM.incrementalTracks(tracks, match.cam1, match.cam2, match.matches);
    });
    tracks = SFM.filterTracks(tracks);
    return tracks;
};

/**
 * @typedef {{cam: number, point: number}} View
 */

/**
 * @typedef {{cam1: number, cam2: number, matches: number[][]}} TwoViewMatches
 */

/**
 * @typedef {Object} Track
 */

/**
 *
 * @param {View[][]} tracks
 * @param {number} cam1
 * @param {number} cam2
 * @param {number[][]} matches
 * @return {View[][]}
 */
SFM.incrementalTracks = function(tracks, cam1, cam2, matches){
    matches.forEach(function(match){
        var matchedTracks = [];
        tracks.forEach(function(track, trackIndex){
            var matched1 = false,
                matched2 = false;
            track.forEach(function(view){
                if (view.cam === cam1 && view.point === match[0]) {
                    matched1 = true;
                }
                else if (view.cam === cam2 && view.point === match[1]) {
                    matched2 = true;
                }
            });
            if (matched1 || matched2) {
                if (!matched2) {
                    track.push({ cam: cam2, point: match[1] });
                }
                if (!matched1) {
                    track.push({ cam: cam1, point: match[0] });
                }
                matchedTracks.push(trackIndex);
            }
        });
        if (matchedTracks.length ===0) {
            tracks.push([
                { cam: cam1, point: match[0] },
                { cam: cam2, point: match[1] }
            ]);
        }
        else if (matchedTracks.length > 1) {
            var combinedTrack = _.flatten(_.map(matchedTracks, function(i){ return tracks[i]; }));
            tracks = _.without(tracks, matchedTracks);
            tracks.push(combinedTrack);
        }
    });
};


/**
 * @param {View[][]} tracks
 * @return {Track[]} tracks
 */
SFM.filterTracks = function(tracks){
    var result = [];
    tracks.forEach(function(track){
        var views = {};
        var consistent = track.every(function(view){
            if (view.cam in views) {
                if (views[view.cam] !== view.point) {
                    return false;
                }
            }
            else {
                views[view.cam] = view.point;
            }
            return true;
        });
        if (consistent) {
            result.push(views);
        }
    });
    return result;
};


SFM.initRegisterCamera = function(cameras, tracks){

};


SFM.findNextCamera = function(construct, cameras){
    var candidates = _.difference(cameras, construct.cameras);
    return _.max(candidates, function(cam){
        return _.filter(construct.triangulated, function(track){
            return track[cam.id] !== undefined;
        }).length;
    });
};


SFM.registerIncrementalCamera = function(nextCamera, construct, tracks){
    var visible = _.filter(tracks, function(track){
        return track[nextCamera.id] !== undefined;
    });
    var anchors = _.filter(construct.triangulated, function(track){
        return track[nextCamera.id] !== undefined;
    });
    var pMatrix = SFM.ransac({
        dataset: anchors,
        subset: 6,
        relGenerator: SFM.sixPoint,
        errorGenerator: SFM.projectionMatrixError,
        outlierThreshold: 0.05,
        errorThreshold: 10,
        trials: 100
    }).rel;
    var dec = pMatrix.subMatrix(0,0,3,3).qrd();
    nextCamera.K = dec.R;
    nextCamera.R = dec.Q;
    nextCamera.t = nextCamera.K.inverse().dot(pMatrix.subMatrix(0,3,3,1));
    var trialPoints = _.intersect(_.difference(visible, construct.triangulated), construct.visible);
    var triangulated = [];
    trialPoints.forEach(function(track){
        SFM.trianguation(track);
    });
    construct.cameras.push(nextCamera);
    construct.triangulated.concat(triangulated);
    construct.visible = _.union(construct.visible, visible);
};


SFM.registerCameras = function(cameras, callback, options){
    options = options || {};
    _.defaults(options, {
        MATCH_OUTLIER_THRESHOLD: 0.04,
        FMATRIX_ERROR_THRESHOLD: 1,
        ANN_THRESHOLD: 0.7
    });

    var matches=[];
    var twoViewMatches, cam1, cam2;
    for (cam1=0; cam1<cameras.length-1; cam1++) {
        for (cam2=cam1+1; cam2<cameras.length; cam2++){
            twoViewMatches = SFM.twoViewMatch(cameras[cam1], cameras[cam2], options.ANN_THRESHOLD);
            twoViewMatches = SFM.ransac({
                dataset: twoViewMatches,
                metadata: [cameras[cam1], cameras[cam2]],
                subset: 8,
                relGenerator: SFM.eightPoint,
                errorGenerator: SFM.fundamentalMatrixError,
                outlierThreshold: options.MATCH_OUTLIER_THRESHOLD,
                errorThreshold: options.FMATRIX_ERROR_THRESHOLD,
                trials: 100
            }).dataset;
            matches.push(twoViewMatches);
        }
    }
    var tracks = SFM.findTracks(matches, cameras);
    var construct = SFM.initRegisterCamera(cameras, tracks);
    var nextCamera = SFM.findNextCamera(construct, cameras);
    while(nextCamera) {
        SFM.registerIncrementalCamera(nextCamera, construct, tracks);
        nextCamera = SFM.findNextCamera(construct, cameras);
    }
    callback(construct);
};