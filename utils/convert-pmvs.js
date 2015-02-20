'use strict';

var lazy = require("lazy"),
    fs  = require("fs");

var FROM = '/home/sheep/Downloads/pmvs-2/data/hall/models.you.should.get.similar.results/option.txt.patch',
    TO = '/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/mvs/patches.json';

var testUtils = require('../src/utils/testing.js');

var pat = /PATCHS/;

var patches = [];
var currentPatch = {};
var counter;

var PATCH_READER_STATES = {
    CORD: 0,
    NORM: 1,
    NCC: 2,
    CONSISTENT_COUNT: 3,
    CONSISTENT: 4,
    INCONSISTENT_COUNT: 5,
    INCONSISTENT: 6
};

var PARSER_STATES = {
    INIT: 0,
    INIT_COUNT: 1,
    WAIT_PATCH: 2,
    PATCH: 3
};

var parseState = PARSER_STATES.INIT,
    patchState = PATCH_READER_STATES.INIT;


new lazy(fs.createReadStream(FROM))
    .lines
    .forEach(function(line){

        if (patches.length === counter) {
            console.log('patches');
            testUtils.promiseSaveJson(TO, patches);
        }

        if (!line) {
            console.log('empty line');
            return;
        }
        else {
            line = line.toString();
        }

        switch (parseState) {
            case PARSER_STATES.INIT:
                parseState = PARSER_STATES.INIT_COUNT;
                return;
            case PARSER_STATES.INIT_COUNT:
                counter = parseInt(line, 10);
                parseState = PARSER_STATES.WAIT_PATCH;
                return;
            case PARSER_STATES.WAIT_PATCH:
                waitPatch();
                break;
            case PARSER_STATES.PATCH:
                matching();
                break;
            default:
                throw 'unexpected parser state!'
        }


        function waitPatch(){
            if (line.match(pat)) {
                parseState = PARSER_STATES.PATCH;
                patchState = PATCH_READER_STATES.CORD;
                currentPatch = {};
            }
        }

        function matching(){
            switch (patchState) {
                case PATCH_READER_STATES.CORD:
                    currentPatch.point = line.split(' ').map(function(chars){ return parseFloat(chars); });
                    patchState = PATCH_READER_STATES.NORM;
                    break;
                case PATCH_READER_STATES.NORM:
                    currentPatch.norm = line.split(' ').map(function(chars){ return parseFloat(chars); });
                    patchState = PATCH_READER_STATES.NCC;
                    break;
                case PATCH_READER_STATES.NCC:
                    currentPatch.ncc = line.split(' ').map(function(chars){ return parseFloat(chars); })[0];
                    patchState = PATCH_READER_STATES.CONSISTENT_COUNT;
                    break;
                case PATCH_READER_STATES.CONSISTENT_COUNT:
                    patchState = PATCH_READER_STATES.CONSISTENT;
                    break;
                case PATCH_READER_STATES.CONSISTENT:
                    currentPatch.consistent = line.split(' ').map(function(chars){ return parseInt(chars, 10); }).slice(0,-1);
                    patchState = PATCH_READER_STATES.INCONSISTENT_COUNT;
                    break;
                case PATCH_READER_STATES.INCONSISTENT_COUNT:
                    if (parseInt(line, 10) === 0) {
                        currentPatch.inconsistent = [];
                        patches.push(currentPatch);
                        parseState = PARSER_STATES.WAIT_PATCH;
                    }
                    else {
                        patchState = PATCH_READER_STATES.INCONSISTENT;
                    }
                    break;
                case PATCH_READER_STATES.INCONSISTENT:
                    currentPatch.inconsistent = line.split(' ').map(function(chars){ return parseInt(chars, 10); }).slice(0,-1);
                    patches.push(currentPatch);
                    parseState = PARSER_STATES.WAIT_PATCH;
                    break;
                default:
                    throw 'unexpected patch state!'
            }
        }

        //console.log(line.toString());

    }
);