'use strict';


function eightPointRansacTest(img1, img2, features1, features2, matches){

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

        return result;
}


$(function(){
    getTwoViewPair('00000035', '00000036', function(img1, img2, features1, features2){
        var matches = SFM.twoViewMatch(features1, features2, 0.8);
        var result = eightPointRansacTest(img1, img2, features1, features2, matches);
        drawTwoViewMatches(img1, img2, features1, features2, result.dataset);
    });
});

