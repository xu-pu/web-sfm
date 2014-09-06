var pool = require('ndarray-scratch');
var Vector = require('sylvester').Vector;

module.exports = homography;
module.exports.pointHomography = pointHomography;


function homography(img, rotation, focal){
    var width = img.shape[1],
        height = img.shape[0],
        buffer = pool.zeros(img.shape);
    var row, col, mapped;
    for(row=0; row<height; row++){
        for(col=0; col<width; col++){
            mapped = pointHomography(rotation, row, col, width, height, focal);
            if (mapped) {
                buffer.set(mapped[0], mapped[1], img.get(row, col));
            }
        }
    }
    return buffer;
}


function pointHomography(rotation, row, col, width, height, focal){
    var x = col-width/2,
        y = -row+height/2;
    var cor = Vector.create([x,y,focal]);
    cor = rotation.multiply(cor);
    cor = cor.multiply(focal/cor.elements[2]);
    col = Math.floor(cor.elements[0]+width/2);
    row = Math.floor(-cor.elements[1]+height/2);
    if (row<height && col<width) {
        return [row, col];
    }
    else {
        return null;
    }
}