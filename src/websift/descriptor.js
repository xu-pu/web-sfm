'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var shortcuts = require('../utils/shortcuts.js'),
    kernels = require('../math/kernels.js'),
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
 * @param {GuassianPyramid} scales
 * @param {OrientedFeature} f
 * @returns {Feature}
 */
exports.descriptor = function(scales, f){

    console.log('Enter descriptor');

    var       row = f.row,
              col = f.col,
             rint = Math.round(row),
             cint = Math.round(col),
              ori = f.orientation,
            sigma = INIT_SIGMA * Math.pow(2, f.scale/INTERVALS),
             hist = shortcuts.zeros(LENGTH),
              SBP = MAGNIF * sigma,
           radius = round(SBP*(NBP+1)*sqrt(2)/2);

    var width, height;

    function addToHist(bx, by, bo, v){
        var offset = (bx * NBP + by) * NBO + bo;
        hist[offset] += v;
    }

    var st0 = Math.sin(ori),
        ct0 = Math.cos(ori);

    var pixRowLB = Math.max(-radius, -rint),       // >=
        pixRowUB = Math.min( radius, height-rint), // <
        pixColLB = Math.max(-radius, -cint),       // >=
        pixColRB = Math.min( radius, width-cint);  // <

    var iterpixMag, iterpixOri, iterpixW,
        iterpixRow, iterpixCol,
        iterpixBX, iterpixBY, iterpixBO,
        iterpixBXint, iterpixBYint, iterpixBOint,
        iterpixBXfloat, iterpixBYfloat, iterpixBOfloat;

    var iterblockDX, iterblockDY, iterblockDO,
        iterblockX, iterblockY, iterblockO, iterblockV;

    var dc, dr, dx, dy;
    for (dc=pixColLB; dc<pixColRB; dc++) {
        for (dr=pixRowLB; dr<pixRowUB; dr++) {

            dx = cint+dc-col;
            dy = rint+dr-row;
            iterpixW = Math.exp((dx*dx+dy*dy)/(2*W_SIGMA*W_SIGMA));
            iterpixRow = rint + dr;
            iterpixCol = cint + dc;
            iterpixMag = gradient.get(iterpixCol, iterpixRow, 0) * iterpixW;
            iterpixOri = gradient.get(iterpixCol, iterpixRow, 1) - ori;


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

    return {
        row: row,
        col: col,
        vector: hist2vector(hist)
    };

};


function interpHist(hist, mag, binRow, binCol, binOri){

    var intR = Math.floor(binRow),
        intC = Math.floor(binCol),
        intO = Math.floor(binOri),
        fraR = binRow - intR,
        fraC = binCol - intC,
        fraO = binOri - intO;

    [0,1].forEach(function(offsetR){

        var row = intR + offsetR,
            weighted = mag;

        if (row < 0 || row >= NBP) {
            return;
        }

        weighted *= ( offsetR === 0 ? 1-fraR : fraR );

        [0,1].forEach(function(offsetC){

            var col = intC + offsetC;

            if (col < 0 || col >= NBP) {
                return;
            }

            weighted *= ( offsetC === 0 ? 1-fraC : fraC );

            [0,1].forEach(function(offsetO){

                var ori = (intO + offsetO) % NBO;

                weighted *= ( offsetO === 0 ? 1-fraO : fraO );

                hist[(NBP*row+col)*NBO+ori] += weighted;

            });

        });

    });


}


/**
 * @param {number[]} hist
 * @returns {int[]}
 */
function hist2vector(hist){

//    console.log(hist);

    hist = normalize(hist);

//    console.log(hist);

    hist = hist.map(function(entry){
        return Math.min(MAG_CAP, entry);
    });

    hist = normalize(hist);

    hist = hist.map(function(entry){
        return Math.min(ENTRY_CAP, Math.round(entry*INT_FACTOR));
    });

    return hist;

    function normalize(a){
        var ind, cursor, memo = 0;
        for(ind=0; ind<a.length; ind++){
            cursor = a[ind];
            memo += cursor*cursor;
        }
        var norm = Math.sqrt(memo);
        return a.map(function(e){
            return e/norm;
        });
    }

}