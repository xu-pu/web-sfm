module.exports = sixPoint;

/**
 * @param {int[][]} dataset
 * @param metadata.cam
 * @param {Feature[]} metadata.features
 * @param {SFM.Matrix[]} metadata.sparse
 * @param metadata
 */
function sixPoint(dataset, metadata){
    if (dataset.length !== 6) {
        throw 'need exact 6 matches';
    }
    var A = new SFM.Matrix({ rows: 12, cols: 12 });
    dataset.forEach(function(match, i){
        var imgPoint = SFM.featureToImg(metadata.features[match[0]], metadata.cam);
        var scenePoint = metadata.sparse[match[1]];
        A.setRow(2*i  , SFM.C(1, 0, -imgPoint.get(0,0)).dot(scenePoint.transpose()).flatten());
        A.setRow(2*i+1, SFM.C(0, 1, -imgPoint.get(1,0)).dot(scenePoint.transpose()).flatten());
    });
    var result = new SFM.Matrix({ rows: 3, cols: 4 });
    result.data.set(A.svdSolve().data);
    return result;
}