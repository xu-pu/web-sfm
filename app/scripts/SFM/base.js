'use strict';


if (typeof SFM === 'undefined') {
    var SFM = {};
}


/*
self.onmessage = function(e) {
    console.log(e.data);
    self.postMessage('done');
};
*/

SFM.STEREO_WORKER = '/build/scripts/stereoworker.js';
SFM.SIFT_WORKER = '/build/scripts/siftworker.js';
SFM.MATCHING_WORKER = '/build/scripts/matchingworker.js';


SFM.MSG_QUERY = 0;
SFM.MSG_CONTROLL = 1;

SFM.CONTROLL_START = 0;
SFM.CONTROLL_STOP = 0;

SFM.STAGE_BEFORE = 0;
SFM.STAGE_EXTRACTOR = 1;
SFM.STAGE_MATCHING = 2;
SFM.STAGE_TRACKING = 3;
SFM.STAGE_REGISTER = 4;
SFM.STAGE_STEREO = 5;
SFM.STAGE_MVS = 6;
SFM.STAGE_AFTER = 7;

SFM.RGB2GRAY_R = 0.2989;
SFM.RGB2GRAY_G = 0.5870;
SFM.RGB2GRAY_B = 0.1140;

SFM.SOBEL_KERNEL_X = [
    [-1,0,1],
    [-2,0,2],
    [-1,0,1]
];

SFM.SOBEL_KERNEL_Y = [
    [ 1, 2, 1],
    [ 0, 0, 0],
    [-1,-2,-1]
];