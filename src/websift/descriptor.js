'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var shortcuts = require('../utils/shortcuts.js'),
    getGradient = require('../math/image-calculus.js').discreteGradient,
    kernels = require('../math/kernels.js'),
    settings = require('./settings.js');

var        WIDTH = settings.DESCRIPTOR_WIDTH,
          LENGTH = settings.DESCRIPTOR_LENGTH,
      INIT_SIGMA = settings.SIGMA_0,
       INTERVALS = settings.INTERVALS,
    SCALE_FACTOR = settings.DESCRIPTOR_SCALE_FACTOR,
            BINS = settings.DESCRIPTOR_BINS,
         MAG_CAP = settings.DESCRIPTOR_MAG_CAP,
      INT_FACTOR = settings.DESCRIPTOR_INT_FACTOR,
       ENTRY_CAP = settings.DESCRIPTOR_ENTRY_CAP,
              PI = Math.PI,
             PI2 = PI * 2;

//===============================================================


/**
 * @param {Scale} scale
 * @param {OrientedFeature} f
 * @returns {Feature}
 */
module.exports.getDescriptor = function(scale, f){

    console.log('Enter descriptor');

    var       row = f.row,
              col = f.col,
                r = Math.round(row),
                c = Math.round(col),
         referOri = f.orientation,
              img = scale.img,
           factor = INIT_SIGMA * Math.pow(2, f.layer/INTERVALS),
        histWidth = factor * SCALE_FACTOR,
           weight = kernels.getGuassian2d(WIDTH),
           radius = Math.round(histWidth * (WIDTH+1) * Math.sqrt(2) / 2 + 0.5),
             hist = shortcuts.zeros(LENGTH);

    var dx, dy;
    for (dx=-radius; dx<=radius; dx++) {
        for (dy=-radius; dy<=radius; dy++) {
            (function(){
                var gra = getGradient(img, c+dx, r+dy);
                if (gra) {
                    var cor = toLocalCord(dx, dy);
                    var mag = gra.mag * weight(cor.x, cor.y);
                    var ori = gra.ori - referOri;
                    ori = ori < 0 ? ori+PI2 : ori;
                    ori = ori >= PI2 ? ori-PI2 : ori;

                    var binRow = cor.y + WIDTH/2 - 0.5,
                        binCol = cor.x + WIDTH/2 - 0.5,
                        bin = BINS*ori/PI2;

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

        if (row < 0 || row >= WIDTH) {
            return;
        }

        weighted *= ( offsetR === 0 ? 1-fraR : fraR );

        [0,1].forEach(function(offsetC){

            var col = intC + offsetC;

            if (col < 0 || col >= WIDTH) {
                return;
            }

            weighted *= ( offsetC === 0 ? 1-fraC : fraC );

            [0,1].forEach(function(offsetO){

                var ori = (intO + offsetO) % BINS;

                weighted *= ( offsetO === 0 ? 1-fraO : fraO );

                hist[(WIDTH*row+col)*BINS+ori] += weighted;

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