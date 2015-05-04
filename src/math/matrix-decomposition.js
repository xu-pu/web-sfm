var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

//=======================================================

/**
 *
 * @param {Matrix} m
 * @returns {{ Q: Matrix, R: Matrix }}
 */
exports.QR3d = function(m){

    var a1 = m.col(1), a2 = m.col(2), a3 = m.col(3);

    var u1 = a1,
        e1 = u1.x(1/u1.modulus());

    var u2 = a2.subtract(param(a2, e1)),
        e2 = u2.x(1/u2.modulus());

    var u3 = a3.subtract(param(a3, e1)).subtract(param(a3, e2)),
        e3 = u3.x(1/u3.modulus());

    var Q = Matrix.create([e1.elements, e2.elements, e3.elements]).transpose(),
        R = Matrix.create([
            [ dot(e1,a1), dot(e1,a2), dot(e1,a3)],
            [ 0         , dot(e2,a2), dot(e2,a3)],
            [ 0         , 0         , dot(e3,a3)]
        ]);


    function dot(x,y){
        return x.dot(y);
    }

    function param(a, e){
        return e.x(dot(e,a)/dot(e,e));
    }

    return { Q: Q, R: R };

};

/**
 *
 * @param {Matrix} m
 * @returns {{ Q: Matrix, R: Matrix }}
 */
exports.RQ3d = function(m){

    var a1 = m.row(3), a2 = m.row(2), a3 = m.row(1);

    var u1 = a1,
        e1 = u1.x(1/u1.modulus());

    var u2 = a2.subtract(param(a2, e1)),
        e2 = u2.x(1/u2.modulus());

    var u3 = a3.subtract(param(a3, e1)).subtract(param(a3, e2)),
        e3 = u3.x(1/u3.modulus());

    var Q = Matrix.create([e3.elements, e2.elements, e1.elements]),
        R = Matrix.create([
            [ dot(e3,a3), dot(e2,a3), dot(e1,a3)],
            [ 0         , dot(e2,a2), dot(e1,a2)],
            [ 0         , 0         , dot(e1,a1)]
        ]);


    function dot(x,y){
        return x.dot(y);
    }

    function param(a, e){
        return e.x(dot(e,a)/dot(e,e));
    }

    return { Q: Q, R: R };

};


/**
 *
 * @param {Matrix} P
 * @returns {{ K: Matrix, R: Matrix, t: Vector }}
 */
exports.KRt = function(P){

    var M = Matrix.create(numeric.getBlock(P.elements, [0,0], [2,2])),
        results = exports.RQ3d(M),
        tri = results.R,
        ratio = 1/tri.e(3,3),
        K = tri.x(ratio),
        R = results.Q,
        t = K.inverse().x(P.col(4).x(ratio));

    return { K: K, R: R, t: t };

};