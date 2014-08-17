var _ = require('underscore'),
    la = require('sylvester'),
    Vector = la.Vector;

module.exports = bruteForceMatch;

function bruteForceMatch(features1, features2, ANN_THRESHOLD){
    var matches = [];
    _.forEach(features1, function(f1, index1){
        // mutual best match
        var match = bestMatch(f1.vector, features2, ANN_THRESHOLD);
        if (match !== null) {
            if (bestMatch(features2[match].vector, features1, ANN_THRESHOLD) === index1) {
                console.log('find one at ' + index1 + '/' + features1.length);
                matches.push([index1, match]);
            }
        }
    });
    return matches;
}

function bestMatch(vec, features, ANN_THRESHOLD){
    var match1=0, match2=0, diff1=Infinity, diff2=Infinity;
    _.forEach(features, function(f2, index2){
        var v1 = Vector.create(vec),
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
    // contrast between best and second match bigger than ANN_THRESHOLD
    if (diff1/diff2 < ANN_THRESHOLD) {
        return match1;
    }
    else {
        return null;
    }
}