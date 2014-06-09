'use strict';


if (typeof SFM === 'undefined') {
    var SFM = {};
}

/**
 *
 */
SFM.getJacobian = function(func, initial){
    var variables = initial.length;
    var result = new SFM.Matrix({ rows: variables, cols: variables });


};


/**
 * Levenberg-Marqurdt Algorithm
 *
 * @param {function} cost
 * @param {number[]} initial
 * @return {number[]}
 */
SFM.sparseLM = function(initial, cost){


    return initial;
};


/**
 *
 * @param {CalibratedCamera} cam1
 * @param {CalibratedCamera} cam2
 * @param {SFM.Matrix} point1
 * @param {SFM.Matrix} point2
 * @param {SFM.Matrix} point
 */
SFM.baTriangulation = function(cam1, cam2, point1, point2, point){
    var variables = _.flatten([
        point1.getNativeRows()[0].slice(0,2),
        point2.getNativeRows()[0].slice(0,2),
        point.getNativeRows()[0].slice(0,3)
    ]);
    SFM.sparseLM(variables, function(v){
        var p1 = new SFM.Matrix({ array: [] });
        var p2 = new SFM.Matrix({ array: [] });
        var p  = new SFM.Matrix({ array: [] });
    });
};



/**
 *
 * @param {CalibratedCamera} cam1
 * @param {CalibratedCamera} cam2
 * @param {SFM.Matrix} point1
 * @param {SFM.Matrix} point2
 * @param {SFM.Matrix} point
 */
SFM.triangulationCost = function(cam1, cam2, point1, point2, point){


};

SFM.registerIncrementCost = function(){};

SFM.registerFirstPairCost = function(){};
