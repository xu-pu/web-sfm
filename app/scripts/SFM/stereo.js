'use strict';

window.SFM = SFM || {};

/**
 *
 * @param {CalibratedCamera} cam1
 * @param {CalibratedCamera} cam2
 * @returns {SFM.Matrix[]}
 */
SFM.rectification = function(cam1, cam2) {
    var R = cam1.R.transpose().dot(cam2.R);
    var t = cam2.t.sub(cam1.t);

    var e1 = t.normalize();
    var e2 = SFM.M([[-t.get(1,0), t.get(0,0), 0]]).normalize();
    var e3 = e1.cross().dot(e2);

    var rect = SFM.M([e1.getNativeCols()[0], e2.getNativeCols()[0], e3.getNativeCols()[0]]);
    return [rect.dot(R), rect];
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
        windowRadius: 3
    });

    var homography = SFM.rectification(cam1, cam2);

    var matches = [];
    var triangulated = [];

    var mapped1 = constructHomography(cam1, features1, homography[0]);
    var mapped2 = constructHomography(cam2, features2, homography[1]);

    // scan line number = image pixel row number

    _.each(mapped1.lines, function(line, index){
        var mirror = mapped1.upper+index-mapped2.upper;
        var upper=mirror-options.windowRadius, lower=mirror+options.windowRadius;
        if (upper<0) {
            upper = 0
        }
        if (lower>=mapped2.lines.length) {
            lower = mapped2.lines.length-1
        }
        _.each(line, function(point1){
            var match = null, distance = Infinity;
            _.each(_.range(upper, lower+1), function(searchLine){
                _.each(mapped2.lines[searchLine], function(point2){
                    var p1 = SFM.featureToImg(features1[point1], cam1),
                        p2 = SFM.featureToImg(features2[point2], cam2);
                    var diff = SFM.diffL2(p1, p2);
                    if (distance > diff) {
                        distance = diff;
                        match = point2;
                    }
                });
            });
            triangulated.push(SFM.trianguation(cam1, cam2, point1, match));
            matches.push([point1, match]);
        });
    });

    callback(matches, triangulated);



    /**
     *
     * @param {CalibratedCamera} cam
     * @param {Feature[]} features
     * @param {SFM.Matrix} homography
     * @return {{upper: int, lower: int, lines: int[][]}} -- feature index
     */
    function constructHomography(cam, features, homography){
        _.each(features, function(feature){
            var p = homography.dot(SFM.featureToImg(feature, cam));
        });
    }

};

SFM.mutiViewStereo = function(views) {

};


SFM.getStereo = function(){};