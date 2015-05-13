'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var shortcuts = require('../utils/shortcuts.js'),
    settings = require('./settings.js');

var EPSILON = settings.EPSILON,
    NBP = settings.DESCRIPTOR_WIDTH,
    NBO = settings.DESCRIPTOR_BINS,
    HNBP = NBP/2,
    W_SIGMA = NBP/2,
    LENGTH = settings.DESCRIPTOR_LENGTH,
    INIT_SIGMA = settings.SIGMA_0,
    INTERVALS = settings.INTERVALS,
    MAGNIF = settings.DESCRIPTOR_SCALE_FACTOR,
    MAG_CAP = settings.DESCRIPTOR_MAG_CAP,
    INT_FACTOR = settings.DESCRIPTOR_INT_FACTOR,
    ENTRY_CAP = settings.DESCRIPTOR_ENTRY_CAP;

var PI = Math.PI,
    PI2 = PI * 2,
    round = Math.round,
    sqrt = Math.sqrt,
    abs = Math.abs;


//===============================================================


/**
 * @param  buffer - ndarray[width,height,2] of gradient
 * @param {OrientedFeature} f
 * @returns {int[]}
 */
exports.getVector = function(buffer, f){

    var row = f.row,
        col = f.col,
        rint = round(row),
        cint = round(col),
        ori = f.orientation,
        sigma = INIT_SIGMA * Math.pow(2, f.scale/INTERVALS),
        SBP = MAGNIF * sigma + EPSILON,
        radius = round(SBP*(NBP+1)*sqrt(2)/2),
        shape = buffer.shape,
        width = shape[0],
        height = shape[1];

    var hist = shortcuts.zeros(LENGTH);

    /**
     * @param {int} bx
     * @param {int} by
     * @param {int} bo
     * @param {number} v
     */
    function addToHist(bx, by, bo, v){
        bx = bx+2;
        by = by+2;
        var offset = (bx * NBP + by) * NBO + bo;
        hist[offset] += v;
    }

    var st0 = Math.sin(ori),
        ct0 = Math.cos(ori);

    var pixRowLB = Math.max(-radius, -rint),       // >=
        pixRowUB = Math.min( radius, height-rint), // <
        pixColLB = Math.max(-radius, -cint),       // >=
        pixColRB = Math.min( radius, width-cint);  // <

    var iterpixMag, iterpixOri, iterpixWei, iterpixRow, iterpixCol,
        iterpixBX, iterpixBY, iterpixBO,
        iterpixBXint, iterpixBYint, iterpixBOint,
        iterpixBXfloat, iterpixBYfloat, iterpixBOfloat;

    var iterblockDX, iterblockDY, iterblockDO,
        iterblockX, iterblockY, iterblockO, iterblockV;

    var WEIGHT_FACTOR = 2*W_SIGMA*W_SIGMA*SBP*SBP;

    var dc, dr, dx, dy;
    for (dc=pixColLB; dc<pixColRB; dc++) {
        for (dr=pixRowLB; dr<pixRowUB; dr++) {

            dx = cint+dc-col;
            dy = rint+dr-row;
            iterpixWei = Math.exp((dx*dx+dy*dy)/WEIGHT_FACTOR);
            iterpixRow = rint + dr;
            iterpixCol = cint + dc;
            iterpixMag = buffer.get(iterpixCol, iterpixRow, 0) * iterpixWei;
            iterpixOri = buffer.get(iterpixCol, iterpixRow, 1) - ori;

            iterpixBX = ( ct0*dx + st0*dy)/SBP - 0.5; // blockX [-1.5, -0.5, 0.5, 1.5] -> [-2 -1 0 1]
            iterpixBY = (-st0*dx + ct0*dy)/SBP - 0.5; // blockY [-1.5, -0.5, 0.5, 1.5] -> [-2 -1 0 1]
            iterpixBO = NBO*iterpixOri/PI2;

            iterpixBXint = Math.floor(iterpixBX);
            iterpixBYint = Math.floor(iterpixBY);
            iterpixBOint = Math.floor(iterpixBO);

            iterpixBXfloat = iterpixBX-iterpixBXint;
            iterpixBYfloat = iterpixBY-iterpixBYint;
            iterpixBOfloat = iterpixBO-iterpixBOint;

            for (iterblockDX=0; iterblockDX<2; iterblockDX++) {
                for (iterblockDY=0; iterblockDY<2; iterblockDY++) {
                    for (iterblockDO=0; iterblockDO<2; iterblockDO++) {

                        iterblockX = iterpixBXint+iterblockDX;
                        iterblockY = iterpixBYint+iterblockDY;
                        iterblockO = (iterpixBOint+iterblockDO)%NBO;

                        if (iterblockX >= -HNBP && iterblockX < HNBP && iterblockY >= -HNBP && iterblockY < HNBP) {

                            iterblockV = iterpixMag *
                            abs(1-iterblockDX-iterpixBXfloat) *
                            abs(1-iterblockDY-iterpixBYfloat) *
                            abs(1-iterblockDO-iterpixBOfloat);

                            addToHist(iterblockX, iterblockY, iterblockO, iterblockV);

                        }

                    }
                }
            }

        }
    }

    return exports.hist2vector(hist);

};


/**
 * @param {number[]} hist
 * @returns {int[]}
 */
exports.hist2vector = function(hist){

    var normed1 = normalize(hist);

    var clamped = normed1.map(function(entry){
        return Math.min(MAG_CAP, entry);
    });

    var normed2 = normalize(clamped);

    return normed2.map(function(entry){
        return Math.min(ENTRY_CAP, round(entry*INT_FACTOR));
    });

    /**
     *
     * @param {number[]} arr
     * @returns {number[]}
     */
    function normalize(arr){
        var norm = sqrt(arr.reduce(function(memo, v){
            return memo + v*v;
        }, 0));
        return arr.map(function(e){
            return e/norm;
        });
    }

};