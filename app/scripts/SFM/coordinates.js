// RC means row and col
// Img means left-bottom origin
// Center means center orgin



/**
 *
 * @param {SFM.Matrix} R
 * @param {SFM.Matrix} t
 * @return {SFM.Matrix}
 */
SFM.getRT = function(R, t){
    var result = new SFM.Matrix({ rows: 3, cols: 4 });
    _.range(3).forEach(function(row){
        _.range(3).forEach(function(col){
            result.set(row, col, R.get(row, col));
        })
    });
    _.range(3).forEach(function(row){
        result.set(row, 3, t.get(row, 0));
    });
    return result
};

/**
 *
 * @param {number} focal
 * @param {number} width
 * @param {number} height
 */
SFM.getK = function(focal, width, height){
    var result = new SFM.Matrix({ rows: 3, cols: 3 });
    result.set(0,0,focal);
    result.set(1,1,focal);
    result.set(2,2,1);
    result.set(0,2,width/2);
    result.set(1,2,height/2);
    return result;
};

/**
 *
 * @param {SFM.Matrix} R
 * @param {SFM.Matrix}t
 * @param {number} focal
 * @param {number} width
 * @param {number} height
 * @returns {SFM.Matrix}
 */
SFM.getProjectionMatrix = function(R, t, focal, width, height){
    var rt = SFM.getRT(R, t);
    var intrinsic = SFM.getK(focal, width, height);
    return intrinsic.dot(rt);
};