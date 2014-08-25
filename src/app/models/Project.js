"use strict";

var IDBAdapter = require('../store/StorageAdapter.js'),
    utils = require('../utils.js');

/**
 * It is different from DemoProject, the Project object contains the state of SFM
 */
module.exports = Ember.Object.extend({

    promiseLoad: function(){
        var adapter = new IDBAdapter(this.get('name'));


    }

});