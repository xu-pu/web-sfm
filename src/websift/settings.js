'use strict';

module.exports.OCTAVES = 5;
module.exports.CONTRAST_THRESHOLD = 255 * 0.04 / exports.OCTAVES;
module.exports.DETECTION_BORDER = 5;
module.exports.ORIENTATION_WINDOW_RADIUS = 8;
module.exports.ORIENTATION_WINDOW = 2 * exports.ORIENTATION_WINDOW_RADIUS + 1;
module.exports.ORIENTATION_BINS = 36;
module.exports.ORIENTATION_BIN_SIZE = 2 * Math.PI / exports.ORIENTATION_BINS;
