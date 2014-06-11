'use strict';


if (typeof SFM === 'undefined') {
    var SFM = {};
}

/**
 * @param {Function[]} funcs
 * @param {number[]} initials
 * @return {SFM.Matrix}
 */
SFM.getJacobian = function(funcs, initials){
    var variables = initials.length;
    var values = funcs.length;
    var result = new SFM.Matrix({ rows: values, cols: variables });
    funcs.forEach(function(func, index){
        _.range(variables).forEach(function(xi){
            var der = SFM.partialDerivative(func, initials, xi);
            result.set(index, xi, der);
        });
    });
    return result;
};

/**
 * @param {Function} func
 * @param {number[]} initials
 * @param {number} xi
 * @return {number}
 */
SFM.partialDerivative = function(func, initials, xi){
    var DELTA = 0.1;
    var neighbor = new Float32Array(initials);
    neighbor[xi] += DELTA;
    return (func(neighbor)-func(initials))/DELTA;
};

/**
 * Levenberg-Marqurdt Algorithm
 *
 * @param {function} generator
 * @param {number[]} initial -- initial parameters
 * @return {number[]}
 */
SFM.lma = function(initial, generator, xv, yv){

    var funcs = generator(initial);


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
