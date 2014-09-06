var _ = require('underscore');

module.exports = tracking;

/**
 * @param {TwoViewMatches[]} matchList
 * @returns {{tracks:Track[], views: Object}}
 */
function tracking(matchList) {
    var tracks = [];
    var views = {};
    matchList.forEach(function(match){
        tracks = incrementalTracks(tracks, match.cam1, match.cam2, match.matches);
        console.log('one incremental tracking finished, ' + tracks.length + 'tracks');
    });

    console.log('begin to filter tracks');
    tracks = filterTracks(tracks);

    console.log('begin to build view list');
    tracks.forEach(function(track, index){
        _.keys(track).forEach(function(view){
            if (view in views) {
                views[view].push(index);
            }
            else {
                views[view] = [index];
            }
        });
    });
    return { tracks: tracks, views: views };
}

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
function incrementalTracks(tracks, cam1, cam2, matches){
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
            var matched = [];
            matchedTracks.forEach(function(index){
                matched.push(tracks.splice(index, 1));
            });
            var combinedTrack = _.flatten(matched);
            tracks.push(combinedTrack);
        }
    });
    return tracks;
}


/**
 * @param {View[][]} tracks
 * @return {Track[]} tracks
 */
function filterTracks(tracks){
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
}