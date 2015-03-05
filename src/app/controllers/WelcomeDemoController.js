'use strict';

var settings = require('../settings.js'),
    ENTRIES = settings.DEMO_ENTRY;

module.exports = Ember.ObjectController.extend({

    needs: ['demos', 'downloader'],

    demoController: null,

    isInprogress: Ember.computed.alias('demoController.isInprogress'),

    isReady: Ember.computed.alias('demoController.isReady'),

    onDemoChange: function(){
        var demos = this.get('controllers.demos'),
            name = this.get('model.name');
        this.set('demoController', demos.findBy('name', name));
    }.observes('model'),

    actions: {

        enter: function(){
            this.get('demoController').send('enter');
        }

    }

});