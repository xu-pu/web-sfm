'use strict';

$(function(){

    threadLogic('00000034', '00000035');
    threadLogic('00000034', '00000036');
    threadLogic('00000034', '00000037');
    threadLogic('00000034', '00000038');
    threadLogic('00000034', '00000039');
    threadLogic('00000034', '00000040');

});

function threadLogic(name1, name2){
    getTwoViewPair(name1, name2, function(img1, img2, features1, features2){
        var matchingWorker = new Worker(SFM.MATCHING_WORKER);
        matchingWorker.onmessage = function(e){
            drawTwoViewMatches(img1,img2, features1, features2, e.data);
        };
        matchingWorker.postMessage({
            img1: { width: img1.width, height: img1.height },
            img2: { width: img2.width, height: img2.height },
            features1: features1,
            features2: features2
        });
    });
}