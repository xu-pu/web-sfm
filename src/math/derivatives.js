'use strict';

module.exports.dx = dx;
module.exports.dy = dy;
module.exports.dxx = dxx;
module.exports.dyy = dyy;
module.exports.dxy = dxy;
module.exports.dyx = dyx;

function dx(img, row, col){
    return img.get(row, col+1) - img.get(row, col);
}

function dy(img, row, col){
    return img.get(row+1, col) - img.get(row, col);
}

function dxx(img, row, col){
    return dx(img, row, col) - dx(img, row, col-1);
}

function dyy(img, row, col){
    return dy(img, row, col) - dy(img, row-1, col);
}

function dxy(img, row, col){
    return dx(img, row, col) - dx(img, row-1, col);
}

function dyx(img, row, col){
    return dy(img, row, col) - dy(img, row, col-1);
}