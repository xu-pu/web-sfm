/**
 *
 * @param {CalibratedCamera} cam1 -- as reference
 * @param {CalibratedCamera} cam2
 * @returns {function[]}
 */
SFM.rectification = function(cam1, cam2) {
    var R = cam2.R.dot(cam1.R.transpose());
    var t = cam2.t.sub(cam1.t);

    var e1 = t.normalize();
    var e2 = SFM.M([[-t.get(1,0), t.get(0,0), 0]]).transpose().normalize();
    var e3 = e1.cross().dot(e2).normalize();

    var rect = SFM.M([e1.getNativeCols()[0], e2.getNativeCols()[0], e3.getNativeCols()[0]]);
    var R1 = rect.dot(R),
        R2 = rect;

    var homo1 = function(x, y){
        var point = SFM.M([[ x-(cam1.width/2), y-(cam1.height/2), cam1.focal ]]).transpose();
        var result = R1.dot(point);
        return [result.get(0,0), result.get(1,0)];
    };

    var homo2 = function(x, y){
        var point = SFM.M([[ x-(cam2.width/2), y-(cam2.height/2), cam2.focal ]]).transpose();
        var result = R2.dot(point).dot(cam1.focal/cam2.focal);
        return [result.get(0,0), result.get(1,0)];
    };

    return [homo1, homo2];
};

/**
 *
 * @param {CalibratedCamera} cam1
 * @param {CalibratedCamera} cam2
 * @param {Feature[]} features1
 * @param {Feature[]} features2
 * @param {function} callback
 * @param {Object} [options]
 */
SFM.twoViewStereo = function(cam1, cam2, features1, features2, callback, options) {

    options = options || {};
    _.defaults(options, {
        windowRadius: 10
    });

    var homography = SFM.rectification(cam1, cam2);

    var matches = [];
    var triangulated = [];

    var mapped1 = constructHomography(cam1, features1, homography[0]);
    var mapped2 = constructHomography(cam2, features2, homography[1]);

    var missmatch = 0;

    var upperBound = Math.min(mapped1.upper, mapped2.upper);
    var lowerBound = Math.max(mapped1.lower, mapped2.lower);

    console.log(upperBound);
    console.log(lowerBound);

    _.range(lowerBound, upperBound+1).forEach(function(line){
        var upper=line+options.windowRadius, lower=line-options.windowRadius;
        if (upper>mapped2.upper) {
            upper = mapped2.upper;
        }
        if (lower<mapped2.lower) {
            lower = mapped2.lower;
        }
        if (mapped1.lines[line]) {
            mapped1.lines[line].forEach(function(point1){
                var match = null, distance = Infinity;
                _.range(lower, upper+1).forEach(function(sl){
                    if (mapped2.lines[sl]) {
                        mapped2.lines[sl].forEach(function(point2){
                            var diff = numeric.norm2(numeric.sub(features1[point1].vector, features2[point2].vector));
                            if (diff < distance) {
                                distance = diff;
                                match = point2;
                            }
                        });
                    }
                });
                if (match !== null) {
                    var pImg1 = SFM.featureToImg(features1[point1], cam1),
                        pImg2 = SFM.featureToImg(features2[match], cam2);
                    var triangulatedPoint = SFM.trianguation(cam1, cam2, pImg1, pImg2);
//                    var triangulationError = SFM.triangulationError(pImg1, pImg2, triangulatedPoint, cam1.P, cam2.P);
//                    console.log(triangulationError);
                    triangulated.push(triangulatedPoint);
                    matches.push([point1, match]);
                }
                else {
                    missmatch += 1;
                }
            });
        }
    });

    console.log(missmatch);

    callback(matches, triangulated);



    /**
     *
     * @param {CalibratedCamera} cam
     * @param {Feature[]} features
     * @param {function} homography
     * @return {{upper: int, lower: int, lines: {}}} -- feature index
     */
    function constructHomography(cam, features, homography){
        var result = {},
            upper = -Infinity,
            lower = Infinity;

        features.forEach(function(feature, index){

            var p = homography(feature.col, cam.height-1-feature.row);

            var line = Math.floor(p[1]);
            if (line>upper) {
                upper = line;
            }
            if (line<lower) {
                lower = line;
            }
            if (result[line]) {
                result[line].push(index);
            }
            else {
                result[line] = [index];
            }
        });
        return { upper: upper, lower: lower, lines: result};
    }

};

SFM.mutiViewStereo = function(views) {

};


SFM.getStereo = function(){};