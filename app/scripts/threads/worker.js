'use strict';

self.onmessage = function(e){
    var task = e.data.task;
    var data = e.data.data;
    switch (task) {
        case SFM.TASK_MATCHING:
            matchingWorker(data, callback);
            break;
        default:
            console.log('invalid task');
            break;
    }

    function callback(data){
        self.postMessage(data);
    }

};

function siftWorker(){

}

function matchingWorker(data, callback){
    var matches = SFM.twoViewMatch(data.features1, data.features2, 0.8);
    var result = SFM.ransac({
        dataset: matches,
        metadata: data,
        subset: 8,
        relGenerator: SFM.eightPoint,
        errorGenerator: SFM.fundamentalMatrixError,
        outlierThreshold: 0.1,
        errorThreshold: 0.5,
        trials: 1000
    }).dataset;
    callback(result);
}

function stereoWorker(cam1, cam2, features1, features2, callback){
    cam1.R = SFM.M(cam1.R);
    cam2.R = SFM.M(cam2.R);
    cam1.t = SFM.M([cam1.t]).transpose();
    cam2.t = SFM.M([cam2.t]).transpose();
    cam1.width = cam2.width = 3000;
    cam1.height = cam2.height = 2000;
    cam1.P = SFM.getProjectionMatrix(cam1.R, cam1.t, cam1.focal, cam1.width, cam1.height);
    cam2.P = SFM.getProjectionMatrix(cam2.R, cam2.t, cam2.focal, cam2.width, cam2.height);
    SFM.twoViewStereo(cam1, cam2, features1, features2, function(matches, triangulated){
        callback(triangulated);
    })
}