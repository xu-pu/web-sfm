var pool = require('ndarray-scratch');
var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports = rectification;

function rectification(r1, r2, t1, t2, f1, f2){
    r1 = Matrix.create(r1);
    r2 = Matrix.create(r2);
    t1 = Vector.create(t1);
    t2 = Vector.create(t2);
    var R = r1.inverse().multiply(r2);
    var t = t2.subtract(t1);

    var ratio = f1/t.elements[2];
    var T = Vector.create([ratio*t.elements[0], ratio*t.elements[1], 1]);

    var e1 = normalize(T);
    var e2 = normalize(Vector.create([-t.elements[1], t.elements[0], 0]));
    var e3 = normalize(e1.cross(e2));
    var rect = Matrix.create([e1.elements, e2.elements, e3.elements]);
    return [rect, rect.multiply(R)]; // R1, R2
}

function normalize(v){
    return v.multiply(1/v.modulus())
}