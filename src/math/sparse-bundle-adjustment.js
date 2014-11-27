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
function bundleAdjustment(cams, points, constrains, vPoints, vCams){

    var pms = cams.map(function(params){

    });

    var J = SFM.getJacobian()

}

/**
 *
 * @param cams
 * @param points
 * @param constrains
 * @returns {number}
 */
function baCost(cams, points, constrain){
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
function baTriangulation(cam1, cam2, point1, point2, point){
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
}