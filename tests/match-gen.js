'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter'),
    pool = require('ndarray-scratch'),
    ndarray = require('ndarray');

var demoloader = require('../src/utils/demo-loader.js'),
    cometdemo = demoloader.cometdemo,
    halldemo = demoloader.halldemo,
    cityhalldemo = demoloader.cityhalldemo,
    testUtils = require('../src/utils/test-utils.js'),
    sift = require('../src/websift/websift.js'),
    match = require('../src/webmatcher/matcher.js');


/**
 *
 * @param {DemoLoader} demo
 * @param i1
 * @param i2
 */
function matchpair(demo, i1, i2){

    if (i1 >= i2) { throw 'index error'; }

    var matchpath = demo.dirroot + '/dev/' + i1 + 'to' + i2 + '.json';

    Promise.all([
        demo.promiseVectorBuffer(i1),
        demo.promiseVectorBuffer(i2)
    ]).then(function(results){
        var vs1 = results[0],
            vs2 = results[1];
        var matches = match.match(vs1, vs2);
        return testUtils.promiseSaveJson(matchpath, matches);
    });

}

var pairs = [
    [0,1],
    [1,2],
    [2,3],
    [3,4],
    [4,5],
    [5,6],

    [4,6],
    [3,6],
    [2,6],

    [3,5],
    [2,5],
    [1,5]
];

var hallpairs = _.range(10, halldemo.images.length-1).map(function(base){
    return [base, base+1];
});

hallpairs.forEach(function(pair){
    matchpair(halldemo, pair[0], pair[1]);
});
// [0-10]