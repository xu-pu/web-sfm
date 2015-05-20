'use strict';

exports.EPSILON = 2.220446049250313e-16;

module.exports.OCTAVES = 5;
module.exports.INTERVALS = 3;
module.exports.SCALES = exports.INTERVALS + 3;
//module.exports.CONTRAST_THRESHOLD = 255 * 0.04 / exports.INTERVALS;
module.exports.CONTRAST_THRESHOLD = 255 * 0.01;

module.exports.SIGMA_N = 0.5;
module.exports.SIGMA_K = Math.pow(2, 1/exports.INTERVALS);
module.exports.SIGMA_0 = 1.6 * exports.SIGMA_K;
module.exports.SIGMA_D0 = exports.SIGMA_0 * Math.sqrt(1-1/(exports.SIGMA_K*exports.SIGMA_K));

module.exports.DETECTION_BORDER = 5;
module.exports.IMAGE_SIZE_THRESHOLD = 2000;

var EDGE_RATIO = 10;
module.exports.EDGE_CURVATURE_THRESHOLD = (EDGE_RATIO+1)*(EDGE_RATIO+1)/EDGE_RATIO;

module.exports.ORIENTATION_WINDOW_FACTOR = 1.5;
module.exports.ORIENTATION_RADIUS_FACTOR = 3;
module.exports.ORIENTATION_WINDOW_RADIUS = 8;
module.exports.ORIENTATION_WINDOW = 2 * exports.ORIENTATION_WINDOW_RADIUS + 1;
module.exports.ORIENTATION_BINS = 36;
module.exports.ORIENTATION_BIN_SIZE = 2 * Math.PI / exports.ORIENTATION_BINS;


module.exports.DESCRIPTOR_WIDTH = 4;
module.exports.DESCRIPTOR_BINS = 8;
module.exports.DESCRIPTOR_LENGTH = exports.DESCRIPTOR_WIDTH * exports.DESCRIPTOR_WIDTH * exports.DESCRIPTOR_BINS;
module.exports.DESCRIPTOR_SCALE_FACTOR = 3;
module.exports.DESCRIPTOR_MAG_CAP = 0.2;
module.exports.DESCRIPTOR_ENTRY_CAP = 255;
module.exports.DESCRIPTOR_INT_FACTOR = 512;
