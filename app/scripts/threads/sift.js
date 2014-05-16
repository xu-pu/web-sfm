'use strict';

self.onmessage = function(e){
    var img = new SFM.Grayscale({ canvas: e.data });
    var result = SFM.sift(img);
    console.log(result);
//    self.postMessage(result);
};