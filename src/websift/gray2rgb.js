var pool = require('ndarray-scratch');

module.exports = toRGB;

function toRGB(img) {
    var width = img.shape[1],
        height = img.shape[0],
        result = pool.malloc([height, width, 3]);
    var row, col;
    for (row=0; row<height; row++) {
        for (col=0; col<width; col++) {
            result.set(row, col, 0, img.get(row, col));
            result.set(row, col, 1, img.get(row, col));
            result.set(row, col, 2, img.get(row, col));
        }
    }
    return result;
}