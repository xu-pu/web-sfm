'use strict';

var _ = require('underscore'),
    ndarray = require('ndarray'),
    Promise = require('promise');

var testUtils = require('./test-utils.js');

exports.DemoLoader = DemoLoader;
exports.halldemo = new DemoLoader(require('/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/description.json'));

var PROJECT_ROOT = '/home/sheep/Code/Project/web-sfm';

function DemoLoader(config){
    _.extend(this, config);
}


/**
 *
 * @param {int} id
 * @returns {Promise}
 */
DemoLoader.prototype.promiseVectorBuffer = function(id){
    var img = _.find(this.images, function(i){ return i.id === id; });
    var path = PROJECT_ROOT + this.root + '/feature.vector/' + img.name + '.vector';
    return testUtils
        .promiseArrayBuffer(path)
        .then(function(buffer){
            var arr = new Uint8Array(buffer),
                length = arr.length/128;
            return ndarray(arr, [length, 128]);
        });
};


/**
 *
 * @param {int} id
 * @returns {Promise}
 */
DemoLoader.prototype.promisePointsBuffer = function(id){
    var img = _.find(this.images, function(i){ return i.id === id; });
    var path = PROJECT_ROOT + this.root + '/feature.point/' + img.name + '.point';
    return testUtils
        .promiseArrayBuffer(path)
        .then(function(buffer){
            var arr = new Float32Array(buffer),
                length = arr.length/4;
            return ndarray(arr, [length, 4]);
        });
};


/**
 *
 * @param {int[]} cams
 * @returns {Promise}
 */
DemoLoader.prototype.promisePointTable = function(cams){
    var _self = this;
    return Promise.all(cams.map(function(cam){
        return _self.promisePointsBuffer(cam);
    })).then(function(results){
        return _.object(cams, results);
    });
};


DemoLoader.prototype.loadRawMatches = function(){
    var path = PROJECT_ROOT + this.root + '/matches/matches.raw.json';
    this.rawMatches = this.rawMatches || tryjson(path) || [];
    return this.rawMatches;
};

/**
 *
 * @param {int} from
 * @param {int} to
 * @returns {TwoViewMatches|null|undefined}
 */
DemoLoader.prototype.getRawMatches = function(from, to){
    return _.find(this.loadRawMatches(), function(entry){
        return entry.from === from && entry.to === to;
    });
};


/**
 *
 * @param {TwoViewMatches} matches
 * @returns {Promise}
 */
DemoLoader.prototype.promiseSaveRawMatches = function(matches){
    var path = PROJECT_ROOT + this.root + '/matches/matches.raw.json';
    var raw = this.loadRawMatches();
    var ind = _.findIndex(raw, function(entry){
        return entry.from === matches.from && entry.to === matches.to;
    });
    if (ind === -1) {
        raw.push(matches);
    }
    else {
        raw[ind] = matches;
    }
    return testUtils.promiseSaveJson(path, raw);
};

//======================================================

function tryjson(path) {
    try {
        return require(path);
    }
    catch (err) {
        return undefined;
    }
}