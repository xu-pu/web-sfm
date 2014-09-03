var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    cord = require('./cord.js');

function drawEpipolarGeometry(ctx, data, matches, F, config){
    var features1 = data.features1,
        features2 = data.features2;
    matches.forEach(function(match){
        var f1 = features1[match[0]],
            f2 = features2[match[1]],
            p1 = cord.RCtoImg(f1.row, f1.col),
            p2 = cord.RCtoImg(f2.row, f2.col),
            l1 = F.x(Vector.create(p2)),
            l2 = Matrix.create([p1]).x(F).row(1);
        drawHomoLine(ctx, l1, config, true);
        drawHomoLine(ctx, l2, config, false);
    });
}


function drawHomoLine(ctx, line, config, isFirst){

}