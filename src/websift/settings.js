'use strict';

module.exports.OCTAVES = 5;
module.exports.INTERVALS = 3;
module.exports.SCALES = exports.INTERVALS + 3;
module.exports.CONTRAST_THRESHOLD = 255 * 0.04 / exports.INTERVALS;
module.exports.INIT_SIGMA = 1.6;
module.exports.INITIAL_SIGMA = 0.5;
module.exports.DETECTION_BORDER = 5;
module.exports.IMAGE_SIZE_THRESHOLD = 1500;

module.exports.EDGE_RATIO = 10;
module.exports.EDGE_CURVATURE_THRESHOLD = Math.pow(exports.EDGE_RATIO+1, 2)/exports.EDGE_RATIO;

module.exports.ORIENTATION_SIGMA_FACTOR = 1.5;
module.exports.ORIENTATION_RADIUS_FACTOR = exports.ORIENTATION_SIGMA_FACTOR * 3;
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
