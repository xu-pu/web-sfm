var pool = require('ndarray-scratch');
var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports = rectification;

function rectification(r1, r2, t1, t2){
    r1 = Matrix.create(r1);
    r2 = Matrix.create(r2);
    t1 = Vector.create(t1);
    t2 = Vector.create(t2);
    var R = r2.dot(r1.transpose());
    var t = t2.subtract(t1);
    var e1 = normalize(t);
    var e2 = normalize(Vector.create([-t.elements[1], t.elements[0], 0]));
    var e3 = normalize(e1.cross(e2));
    var rect = Matrix.create([e1.elements, e2.elements, e3.elements]);
    return [rect.multiply(R), rect]; // R1, R2
}

function normalize(v){
    return v.multiply(1/v.modulus())
}