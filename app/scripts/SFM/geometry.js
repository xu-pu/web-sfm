/**
 * @param {SFM.Matrix} point
 * @param {CalibratedCamera} cam
 */
SFM.projection = function(point, cam){
    var rt = SFM.getRT(cam.R, cam.t);
    var camPoint = rt.dot(point);

};




/**
 * @param {SFM.Matrix} pImg1
 * @param {SFM.Matrix} pImg2
 * @param {SFM.Matrix} p
 * @param {SFM.Matrix} P1
 * @param {SFM.Matrix} P2
 */
SFM.triangulationError = function(pImg1, pImg2, p, P1, P2){
    return P1.dot(p).homogeneous().sub(pImg1).l2Norm() + P2.dot(p).homogeneous().sub(pImg2).l2Norm();
};