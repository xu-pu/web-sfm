'use strict';

var Promise = require('promise'),
    Lazy = require("lazy"),
    fs  = require("fs");

var testUtils = require('./testing.js');


/**
 *
 * @param {string} path
 * @returns {Promise}
 */
exports.convertSIFT = function(path){

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

                    var parsed = line.toString()
                        .split(/\s+/)
                        .slice(1)
                        .map(function(s){
                            return parseInt(s, 10);
                        });

                    vector = vector.concat(parsed);

                }

                function addFeature(){

                    var result = line.toString()
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

exports.convertSIFT('/home/sheep/Downloads/siftDemoV4/test.key')
    .then(function(data){
        console.log(data[0]);
        console.log(data[data.length-1].vector.length);
    });