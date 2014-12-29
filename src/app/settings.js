'use strict';


module.exports.STAGES = {
    BEFORE: 0,
    EXTRACTOR : 1,
    MATCHING : 2,
    TRACKING : 3,
    REGISTER : 4,
    STEREO: 5,
    MVS: 6,
    AFTER: 7
};


module.exports.STATES = {
    RUNNING: 0,
    STOPPED: 1,
    DONE: 2
};


module.exports.STORES = {
    FEATURES: 'features',
    FULLIMAGES: 'fullimages',
    THUMBNAILS: 'thumbnails',
    IMAGES: 'images',
    MATCHES: 'matches',
    SINGLETONS: 'singletons',
    TRACKS: 'tracks',
    VIEWS: 'views',
    MVS: 'mvs',
    BUNDLER: 'bundler'
};


module.exports.LOCAL_STORE = {
    DEMOS: 'demos',
    PROJECTS: 'projects',
    PROJECT: 'project'
};


//==========================================
// Task Constants
//==========================================


module.exports.TASKS = {
    SIFT: 0,
    MATCHING: 1,
    STEREO: 2,
    TRACKING: 3,
    DOWNLOAD_JSON: 4,
    DOWNLOAD_IMAGE: 5
};


module.exports.TASK_STATES = {
    UNASSIGNED: 0,
    PENDING: 1,
    RUNNING: 2,
    FINISHED: 3
};


//==========================================
// Worker Constants
//==========================================

module.exports.WORKER_SCRIPT = '/build/worker.js';

module.exports.WORKER_STATE = {
    IDLE: 0,
    BUSY: 1,
    ASYNC: 2
};