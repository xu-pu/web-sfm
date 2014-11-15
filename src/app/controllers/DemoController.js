"use strict";

var _ = require('underscore');

var utils = require('../utils.js'),
    settings = require('../settings.js');


module.exports = Ember.ObjectController.extend({

    needs: ['downloadScheduler', 'sfmStore'],

    loader: Ember.computed.alias('controllers.downloadScheduler'),

    isInprogress: function(){
        return this.get('isDownloading') && !this.get('isDownloaded');
    }.property('isDownloading', 'isDownloaded'),

    isDownloading: false,

    adapter: null,

    isConfirmDelete: false,

    isDeleting: false,

    actions: {

        'delete': function(){
            this.set('isConfirmDelete', false);
            this.promiseDelete();
        },

        download: function(){
            this.set('isDownloading', true);
            this.get('loader').downloadDemo(this.get('model'));
        },

        enter: function(){
            this.get('controllers.sfmStore').set('currentProject', this.get('model'));
            this.transitionToRoute('workspace');
        },

        confirmDelete: function(){
            this.toggleProperty('isConfirmDelete');
        },

        cancelDelete: function(){
            this.set('isConfirmDelete', false);
        }

    },


    promiseDelete: function(){

        var _self = this,
            store = this.get('controllers.sfmStore');

        store.promiseProject()
            .then(function(project){
                if (project.get('name') === _self.get('name')) {
                    store.set('currentProject', null);
                }
            })
            .catch()
            .then(function(){
                _self.set('isDeleting', true);
                var request = indexedDB.deleteDatabase(_self.get('name'));
                request.onsuccess = function(){
                    _self.setProperties({
                        'finishedImages': [],
                        'finishedSIFT': [],
                        'bundlerFinished': false,
                        'mvsFinished': false
                    });
                    _self.set('isDeleting', false);
                };
            });
    }

});