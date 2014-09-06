module.exports = trianguation;

/**
 *
 * @param {CalibratedCamera} cam1
 * @param {CalibratedCamera} cam2
 * @param {SFM.Matrix} img1Point
 * @param {SFM.Matrix} img2Point
 */
function trianguation(cam1, cam2, img1Point, img2Point){
    var A = new SFM.Matrix({ rows: 4, cols: 4 });
    A.setRow(0, cam1.P.getRow(2).dot(img1Point.get(0,0)).sub(cam1.P.getRow(0)));
    A.setRow(1, cam1.P.getRow(2).dot(img1Point.get(1,0)).sub(cam1.P.getRow(1)));
    A.setRow(2, cam2.P.getRow(2).dot(img2Point.get(0,0)).sub(cam2.P.getRow(0)));
    A.setRow(3, cam2.P.getRow(2).dot(img2Point.get(1,0)).sub(cam2.P.getRow(1)));
    return A.svdSolve().homogeneous();
}