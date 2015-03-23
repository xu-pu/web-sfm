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

DemoLoader.prototype.promisePointTable = function(cams){
    var _self = this;
    return Promise.all(cams.map(function(cam){
        return _self.promisePointsBuffer(cam);
    })).then(function(results){
        return _.object(cams, results);
    });
};
