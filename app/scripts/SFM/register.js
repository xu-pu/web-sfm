SFM.TRACK_THRESHOLD = 2;
SFM.ANN_THRESHOLD = 0.6;
SFM.FMATRIX_ERROR_THRESHOLD = 1;
SFM.MATCH_OUTLIER_THRESHOLD = 0.006;





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
    var tracks = SFM.tracking(matches, cameras);
    var construct = SFM.initRegisterCamera(cameras, tracks);
    var nextCamera = SFM.findNextCamera(construct, cameras);
    while(nextCamera) {
        SFM.registerIncrementalCamera(nextCamera, construct, tracks);
        nextCamera = SFM.findNextCamera(construct, cameras);
    }
    callback(construct);
};