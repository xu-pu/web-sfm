'use strict';

window.SFM = window.SFM || {};

/*
self.onmessage = function(e) {
    console.log(e.data);
    self.postMessage('done');
};
*/

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