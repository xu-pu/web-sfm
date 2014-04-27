'use strict';

window.SFM = window.SFM || {};

SFM.DATA = {
    cameras: [],
    features: [],
    tracks: [],
    sparse: {
        calibrated: [],
        triangulated: []
    }
};

SFM.TRACK_THRESHOLD = 2;
SFM.ANN_THRESHOLD = 0.6;
SFM.F_MATRIX_THRESHOLD = 1;
SFM.MATCH_OUTLIER_THRESHOLD = 0.006;


/**
 * @param {Object[]} dataset
 * @param {number} outlierThreshold
 * @param {int} trials
 * @param cam1
 * @param cam2
 */
SFM.ransac = function(cam1, cam2, dataset, outlierThreshold, trials){

    var POOL_SIZE = dataset.length;
    var SAMPLE_SIZE = 8;
    var relEsitmate, inliers;
    while(trials !== 0){
        relEsitmate = SFM.eightPointAlgorithm(cam1, cam2, _.sample(dataset, SAMPLE_SIZE));
        inliers = _.filter(dataset, function(match){
            return SFM.fundamentalMatrixVerifier(relEsitmate, cam1, match[0], cam2, match[1]);
        });
        if (inliers.length/POOL_SIZE >= 1-outlierThreshold) {
            return inliers;
        }
        trials--;
    }
    throw "RANSAC faild";
};

SFM.fivePointAlgorithm = function(){};

SFM.eightPointAlgorithm = function(cam1, cam2, matches){
    var c1=SFM.DATA.cameras[cam1], c2=SFM.DATA.cameras[cam2];
    var features1 = SFM.DATA.features[cam1], features2 = SFM.DATA.features[cam2];

    var T1 = [
        [2.0/c1.width, 0, 1],
        [0, -2.0/c1.height, 1],
        [0,0,1]
    ];
    var T2 = [
        [2.0/c2.width, 0, 1],
        [0, -2.0/c2.height, 1],
        [0,0,1]
    ];
    var A = _.map(matches, function(match){
        var p1 = numeric.dot(T1, [ features1[match[0]].col, features1[match[0]].row, 1 ]);
        var p2 = numeric.dot(T2, [ features1[match[1]].col, features2[match[1]].row, 1 ]);
        return _.flatten(numeric.dot(numeric.transpose([p2]), [p1]));
    });
    var result = numeric.svd(A);
    var f = _.last(result.V);
    var F = _.map(_.range(3), function(row){
        return [f[row], f[row+3], f[row+6]];
    });
    if (numeric.det(F) !== 0) {
        var fSVD = numeric.svd(F);
        fSVD.D[2] = 0;
        F = numeric.dot(numeric.dot(fSVD.U, fSVD.D), numeric.transpose(fSVD.V));
    }
    F = numeric.dot(numeric.dot(numeric.transpose(T1), F), T2);
    return F;
};

SFM.fundamentalMatrixVerifier = function(F, cam1, point1, cam2, point2){
    var f1 = SFM.DATA.features[cam1][point1], f2 = SFM.DATA.features[cam2][point2];
    var x1 = [f1.col, f1.row, 1], x2 = [f2.col, f2.row, 1];
    var error = numeric.dot(numeric.dot(x1, F), x2);

};

SFM.dlt = function(cam, tracks){


};


SFM.matchFeatures = function(){
    // two-view pair oriented
    var matches, cam1, cam2, cams=SFM.DATA.cameras.length;
    for (cam1=0; cam1<cams-1; cam1++){
        for (cam2=cam1+1; cam2<cams; cam2++){
            matches = SFM.bruteforceTwoViewMatch(cam1, cam2);
            matches = SFM.ransac(cam1, cam2, matches, SFM.MATCH_OUTLIER_THRESHOLD ,SFM.F_MATRIX_THRESHOLD, 100);
            _.each(matches, function(match){
                SFM.DATA.features[cam1][match[0]].matches.push([cam2, match[1]]);
                SFM.DATA.features[cam2][match[1]].matches.push([cam1, match[0]]);
            });
        }
    }
};

SFM.bruteforceTwoViewMatch = function(cam1, cam2){
    var features = SFM.DATA.features;
    var matches = [];
    _.range(features[cam1].length).forEach(function(f1){
        var match1=0, match2=0, diff1=Infinity, diff2=Infinity;
        _.range(features[cam2].length).forEach(function(f2){
            var diff = numeric.norm2(numeric.sub(features[cam1][f1].vector, features[cam2][f2].vector));
            if (diff<diff1){
                match2 = match1;
                diff2 = diff1;
                match1 = f2;
                diff1 = diff;
            }
            else if (diff>diff1 && diff<diff2) {
                match2 = f2;
                diff2 = diff;
            }
        });
        if (diff1/diff2 < SFM.ANN_THRESHOLD) {
            matches.push([f1, match1]);
        }
    });
    return matches;
};

SFM.findTracks = function() {

    // spacial point oriented
    var record, cam, feature, features, cams = SFM.DATA.cameras.length;
    for (cam=0; cam<cams; cam++){
        features = SFM.DATA.features[cam].length;
        for (feature=0; feature<features; feature++){
            record = traverseTrack([], cam, feature);
            if (record){
                registerTrack(record);
            }
        }
    }

    function traverseTrack(record, cam, feature){
        if (SFM.DATA.features[cam][feature].track === undefined){
            SFM.DATA.features[cam][feature].track = null;
            record.push([cam, feature]);
            _.each(SFM.DATA.features[cam][feature].matches, function(item){
                traverseTrack(record, item[0], item[1]);
            });
            return record;
        }
        else {
            return false;
        }
    }

    function registerTrack(record){
        var matches = {}, errors = {}, index = SFM.DATA.tracks.length;
        _.each(record, function(feature){
            // filter out inconsistent matches
            if (feature[0] in errors) {}
            else if (feature[0] in matches){
                delete matches[feature[0]];
                errors[feature[0]] = null;
            }
            else {
                matches[feature[0]] = feature[1];
            }
        });
        if (_.keys(matches).length >= SFM.TRACK_THRESHOLD) {
            _.each(matches, function(feature){
                SFM.DATA.features[feature[0]][feature[1]].track = index;
            });
            SFM.DATA.tracks.push({
                views: matches
            });
        }
    }

};


SFM.estimateCameras = function(){

    var visibility = [];

    initialPair();



    function initialPair(){


    }

    function triangulateTrack(i){


    }

};