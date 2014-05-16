'use strict';

self.onmessage = function(e){
    console.log('inside worker');
    threadLogic(e.data.cam1, e.data.cam2, e.data.features1, e.data.features2, function(result){
        self.postMessage(result);
    });
};


function threadLogic(cam1, cam2, features1, features2, callback){
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