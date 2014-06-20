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
 * @param {number[]} params -- initial parameters
 * @param constrains
 * @return {number[]}
 */
SFM.lma = function(params, generator, constrains){

    var func = generator(params);
    var error = constants.map(function(constrain){
        return func
    });

    return params;
};



/**
 * @typedef {{ cam: number, point2d: SFM.Matrix, point3d: number }} ProjectionConstrain
 */



/**
 *
 * @param cams
 * -- a list of parameters that can construct projection matrix
 * -- include rotation, translation, focal
 *
 * @param {SFM.Matrix[]} points
 * @param {ProjectionConstrain[]} constrains
 * @param {number[]} vPoints
 * @param {number[]} vCams
 */
SFM.bundleAdjustment = function(cams, points, constrains, vPoints, vCams){

    var pms = cams.map(function(params){

    });

    var J = SFM.getJacobian()

};



/**
 *
 * @param cams
 * @param points
 * @param constrains
 * @returns {number}
 */
SFM.baCost = function(cams, points, constrain){
    var error = constrains.map(function(constrain){
        var cam = cams[constrain.cam],
            point2d = points[constrain.point2d],
            point3d = points[constrain.point3d];
        return cam.dot(point3d).homogeneous().sub(point2d).l2Norm();
    });
    return SFM.R(error).l2Norm();
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
