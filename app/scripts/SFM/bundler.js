'use strict';

function matchPair(features1, features2) {
    // two-view pair oriented
    var kdtree = getKdtree(features1);
    var matches = kdtree.match(features2);
    var inliners = RANSAC(matches);
    return inliners;
}

function findTracks(pairs) {
    // spatial point oriented


}

