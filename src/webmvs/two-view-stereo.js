
module.exports = getTwoViewStereo;


function rectification(img1, img2, r1, r2, t1, t2, f1, f2){
    var roations = getRotation(r1, r2, t1, t2);
    var homo1 = homography(img1, roations[0], f1);
    var homo2 = homography(img2, roations[1], f2);
    return [homo1, homo2];
}


function getTwoViewStereo(){

}
