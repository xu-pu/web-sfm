var _ = require('underscore'),
    la = require('sylvester'),
    Vector = la.Vector;

module.exports = bruteForceMatch;

function bruteForceMatch(features1, features2, ANN_THRESHOLD){
    var matches = [];
    _.forEach(features1, function(f1, index1){
        var match1=0, match2=0, diff1=Infinity, diff2=Infinity;
        _.forEach(features2, function(f2, index2){
            var v1 = Vector.create(f1.vector),
                v2 = Vector.create(f2.vector);
            var diff = v1.subtract(v2).modulus();
            if (diff<diff1){
                match2 = match1;
                diff2 = diff1;
                match1 = index2;
                diff1 = diff;
            }
            else if (diff>diff1 && diff<diff2) {
                match2 = index2;
                diff2 = diff;
            }
        });
        if (diff1/diff2 < ANN_THRESHOLD) {
            matches.push([index1, match1]);
        }
    });
    return matches;
}