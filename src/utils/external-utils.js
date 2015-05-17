'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    Lazy = require("lazy"),
    fs  = require("fs"),
    Canvas = require('canvas');

var testing = require('./testing.js'),
    testUtils = require('./test-utils.js');

require('shelljs/global');

var SIFT_PROGRRAM_PATH = '/home/sheep/Downloads/siftDemoV4/sift',
    PROJECT_ROOT = '/home/sheep/Code/Project/web-sfm';

exports.promiseCMD = function(cmd){
    return new Promise(function(resolve, reject){
        exec(cmd, { async: true }, function(code, output){
            if (code === 0) {
                resolve(output);
            }
            else {
                reject(output);
            }
        });
    });
};


/**
 *
 * @param {string} path - image full path
 */
exports.loweSIFT = function(path){

    var filename = _.last(path.split('/')),
        tmpPGM = '/tmp/' + filename + '.pgm',
        tmpTXT = '/tmp/' + filename + '.sift',
        conversionCMD = _.template('convert <%= input %> <%= output %>')({ input: path, output: tmpPGM }),
        siftCMD = _.template('<%= program %> < <%= input %> > <%= output %>')({ program: SIFT_PROGRRAM_PATH, input: tmpPGM, output: tmpTXT });

    return exports.promiseCMD(conversionCMD)
        .then(function(){
            return exports.promiseCMD(siftCMD);
        })
        .then(function(){
            return exports.promiseConvertSIFT(tmpTXT);
        })
        .then(function(data){
            rm(tmpPGM, tmpTXT);
            return data;
        });

};


/**
 * Load a lowe format SIFT result file
 * @param {string} path
 * @returns {Promise}
 */
exports.promiseConvertSIFT = function(path){

    var SIFT_STATE = {
        INIT: 0,
        HEAD: 1,
        LINE1: 2,
        LINE2: 3,
        LINE3: 4,
        LINE4: 5,
        LINE5: 6,
        LINE6: 7,
        LINE7: 8
    };

    return new Promise(function(resolve, reject){

        var result = [];

        var vector, cursor,
            state = SIFT_STATE.INIT;

        var handler = new Lazy(fs.createReadStream(path))
            .lines
            .forEach(function(line){

                switch (state) {

                    case SIFT_STATE.INIT:
                        state = SIFT_STATE.HEAD;
                        break;
                    case SIFT_STATE.HEAD:
                        vector = [];
                        addFeature();
                        state = SIFT_STATE.LINE1;
                        break;
                    case SIFT_STATE.LINE1:
                        addVector();
                        state = SIFT_STATE.LINE2;
                        break;
                    case SIFT_STATE.LINE2:
                        addVector();
                        state = SIFT_STATE.LINE3;
                        break;
                    case SIFT_STATE.LINE3:
                        addVector();
                        state = SIFT_STATE.LINE4;
                        break;
                    case SIFT_STATE.LINE4:
                        addVector();
                        state = SIFT_STATE.LINE5;
                        break;
                    case SIFT_STATE.LINE5:
                        addVector();
                        state = SIFT_STATE.LINE6;
                        break;
                    case SIFT_STATE.LINE6:
                        addVector();
                        state = SIFT_STATE.LINE7;
                        break;
                    case SIFT_STATE.LINE7:
                        addVector();
                        cursor.vector = vector;
                        result.push(cursor);
                        state = SIFT_STATE.HEAD;
                        break;
                    default:
                        throw 'Invalid state';
                }

                function addVector(){

                    var parsed = line
                        .toString()
                        .trim()
                        .split(/\s+/)
                        .map(function(s){
                            return parseInt(s, 10);
                        });

                    vector = vector.concat(parsed);

                }

                function addFeature(){

                    var result = line
                        .toString()
                        .split(/\s+/)
                        .map(function(s){
                            return parseFloat(s);
                        });

                    cursor = {
                        row: result[0],
                        col: result[1],
                        scale: result[2],
                        orientation: result[3]
                    };

                }

            }
        );

        handler.on('pipe', function(){
            resolve(result);
        });

    });

};