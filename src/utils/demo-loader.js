'use strict';

var _ = require('underscore'),
    ndarray = require('ndarray'),
    Promise = require('promise');

var testUtils = require('./test-utils.js'),
    extUtils = require('./external-utils.js');

exports.DemoLoader = DemoLoader;
exports.halldemo = new DemoLoader(require('/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/description.json'));
exports.cityhalldemo = new DemoLoader(require('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/description.json'));
exports.cometdemo = new DemoLoader(require('/home/sheep/Code/Project/web-sfm/demo/Rosetta-Spacecraft/description.json'));

var PROJECT_ROOT = '/home/sheep/Code/Project/web-sfm';

function DemoLoader(config){
    _.extend(this, config);
}

DemoLoader.prototype.genImageJson = function(){
    extUtils.genImagesJson(this);
};

DemoLoader.prototype.genLoweSift = function(i){
    var img = _.find(this.images, function(entry){ return entry.id === i; });
    var imgPath = PROJECT_ROOT + this.root + '/images/' + img.name + img.extension;
    var pointPath = PROJECT_ROOT + this.root + '/feature.point/' + img.name + '.point';
    var vectorPath = PROJECT_ROOT + this.root + '/feature.vector/' + img.name + '.vector';
    return extUtils
        .loweSIFT(imgPath)
        .then(function(data){
            var len = data.length,
                vectorArr = new Uint8Array(len*128),
                pointArr = new Float32Array(len*4),
                vectors = ndarray(vectorArr, [len, 128]),
                points = ndarray(pointArr, [len, 4]);
            data.forEach(function(f, i){
                points.set(i, 0, f.row);
                points.set(i, 1, f.col);
                points.set(i, 2, f.orientation);
                points.set(i, 3, f.scale);
                f.vector.forEach(function(v, vi){
                    vectors.set(i, vi, v);
                });
            });
            return Promise.all([
                testUtils.promiseSaveArrayBuffer(pointPath, pointArr.buffer),
                testUtils.promiseSaveArrayBuffer(vectorPath, vectorArr.buffer)
            ]);
        });
};


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
 * row, col, ori, scale
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


/**
 *
 * @param {TwoViewMatches[]} matchtable
 * @returns {Promise}
 */
DemoLoader.prototype.promiseSaveRawMatchTable = function(matchtable){
    var path = PROJECT_ROOT + this.root + '/matches/matches.raw.json';
    var raw = this.loadRawMatches();
    matchtable.forEach(function(matches){
        var ind = _.findIndex(raw, function(entry){
            return entry.from === matches.from && entry.to === matches.to;
        });
        if (ind === -1) {
            raw.push(matches);
        }
        else {
            raw[ind] = matches;
        }
    });
    return testUtils.promiseSaveJson(path, raw);
};



//======================================================
// Robust Matches
//======================================================


DemoLoader.prototype.loadRobustMatches = function(){
    var path = PROJECT_ROOT + this.root + '/matches/matches.robust.json';
    this.robustMatches = this.robustMatches || tryjson(path) || [];
    return this.robustMatches;
};

/**
 *
 * @param {int} from
 * @param {int} to
 * @returns {TwoViewMatches|null|undefined}
 */
DemoLoader.prototype.getRobustMatches = function(from, to){
    return _.find(this.loadRobustMatches(), function(entry){
        return entry.from === from && entry.to === to;
    });
};


/**
 *
 * @param {TwoViewMatches} matches
 * @returns {Promise}
 */
DemoLoader.prototype.promiseSaveRobustMatches = function(matches){
    var path = PROJECT_ROOT + this.root + '/matches/matches.robust.json';
    var robust = this.loadRobustMatches();
    var ind = _.findIndex(robust, function(entry){
        return entry.from === matches.from && entry.to === matches.to;
    });
    if (ind === -1) {
        robust.push(matches);
    }
    else {
        robust[ind] = matches;
    }
    return testUtils.promiseSaveJson(path, robust);
};


DemoLoader.prototype.requireDense = function(){
    if (!this.dense) {
        this.dense = require(PROJECT_ROOT + this.root + '/mvs/patches.json');
    }
    return this.dense;
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