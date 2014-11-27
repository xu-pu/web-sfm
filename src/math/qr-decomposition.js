/**
 * @return {{ Q: SFM.Matrix, R: SFM.Matrix }}
 */
function qrDecomposition(){
    var r11, q1, a1;
    var Q = new SFM.Matrix({ rows: this.rows, cols: this.cols }),
        R = new SFM.Matrix({ rows: this.cols, cols: this.cols });
    a1 = this.getCol(0);
    r11 = a1.l2Norm();
    q1 = a1.dot(1/r11);

    Q.setCol(0, q1);
    R.set(0,0, r11);

    if ( Q.getType() === this.TYPE_VECTOR && R.getType() === this.TYPE_SCALAR ) {
        console.log('end of recursive QR decompistion');
    }
    else {
        var A2 = this.subMatrix(0,1,this.rows, this.cols-1);
        var R12 = q1.transpose().dot(A2);
        var recur = A2.sub(q1.dot(R12));
        var result = recur.qrDecomposition();
        Q.setRegion(0,1, result.Q);
        R.setRegion(0, 1, R12);
        R.setRegion(1,1, result.R);
    }
    return { Q: Q, R: R};
}
