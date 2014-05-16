'use strict';

self.onmessage = function(e){
    var data = e.data;
    threadLogic(data.img1, data.img2, data.features1, data.features2, function(result){
        self.postMessage(result.dataset);
    });
};

function threadLogic(img1, img2, features1, features2, callback){
    var matches = SFM.twoViewMatch(features1, features2, 0.8);

    var metadata = {
        features1: features1,
        features2: features2,
        cam1: img1,
        cam2: img2
    };

    var result = SFM.ransac({
        dataset: matches,
        metadata: metadata,
        subset: 8,
        relGenerator: SFM.eightPoint,
        errorGenerator: SFM.fundamentalMatrixError,
        outlierThreshold: 0.1,
        errorThreshold: 0.5,
        trials: 1000
    });

    callback(result);
}

