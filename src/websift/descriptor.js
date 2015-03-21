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
    sqrt = Math.sqrt;


//===============================================================


/**
 * @param {GuassianPyramid} scales
 * @param {OrientedFeature} f
 * @returns {Feature}
 */
module.exports.getDescriptor = function(scales, f){

    console.log('Enter descriptor');

    var       row = f.row,
              col = f.col,
                r = Math.round(row),
                c = Math.round(col),
            layer = f.layer,
         referOri = f.orientation,
        sigma = INIT_SIGMA * Math.pow(2, f.scale/INTERVALS),
//           factor = INIT_SIGMA * Math.pow(2, f.layer/INTERVALS),
//        histWidth = factor * MAGNIF,
//           radius = Math.round(histWidth * (NBP+1) * Math.sqrt(2) / 2 + 0.5),
             hist = shortcuts.zeros(LENGTH),
        SBP = MAGNIF * sigma,
        radius = round( sqrt(2) * SBP * (NBP+1) / 2),
        weight = kernels.getGuassian2d(NBP);

    var colCursor, rowCursor;
    for (colCursor=-radius; colCursor<=radius; colCursor++) {
        for (rowCursor=-radius; rowCursor<=radius; rowCursor++) {
            (function(){
                var gra = scales.getGradient(c+colCursor, r+rowCursor, layer);
                if (gra) {
                    var cor = toLocalCord(colCursor, rowCursor);
                    var mag = gra.mag * weight(cor.x, cor.y);
                    var ori = gra.ori - referOri;
                    ori = ori < 0 ? ori+PI2 : ori;
                    ori = ori >= PI2 ? ori-PI2 : ori;

                    var binRow = cor.y + NBP/2 - 0.5,
                        binCol = cor.x + NBP/2 - 0.5,
                        bin = NBO*ori/PI2;

                    interpHist(hist, mag, binRow, binCol, bin);
                }
            })();
        }
    }

    return {
        row: row,
        col: col,
        vector: hist2vector(hist)
    };


    /**
     *
     * @param x
     * @param y
     * @returns {XY}
     */
    function toLocalCord(x, y){
        var cost = Math.cos(referOri),
            sint = Math.sin(referOri);
        return {
            x: (cost * x - sint * y) / histWidth,
            y: (sint * x + cost * y) / histWidth
        };
    }

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