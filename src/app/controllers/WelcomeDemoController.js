'use strict';

var settings = require('../settings.js'),
    ENTRIES = settings.DEMO_ENTRY;

module.exports = Ember.ObjectController.extend({

    needs: ['demos'],

    demoController: null,

    isInprogress: Ember.computed.alias('demoController.isInprogress'),

    isReady: Ember.computed.alias('demoController.isReady'),

    onDemoChange: function(){
        var demos = this.get('controllers.demos'),
            name = this.get('model.name');
        this.set('demoController', demos.findBy('name', name));
    }.observes('model'),

    actions: {

        progress: function(){
            if (!this.get('isInprogress')) {
                if (this.get('isReady')) {
                    this.get('demoController').send('enter');
                }
                else {
                    this.get('demoController').send('download');
                }
            }
        },

        toggleSelection: function(entry){

            var entries = this.get('entries'),
                selected = this.get('selectedEntries'),
                loaded = this.get('loadedEntries');

            if (this.get('isInprogress') || !entries.contains(entry)) {
                return;
            }

            if (!selected.contains(entry)) {
                selected.addObject(entry);
            }
            else {

                var needDelete = false;

                switch (entry) {
                    case ENTRIES.IMAGE:
                        needDelete = this.get('loadedImages.length') > 0;
                        break;
                    case ENTRIES.FEATURE:
                        needDelete = this.get('loadedFeatures.length') > 0;
                        break;
                    default:
                        needDelete = loaded.contains(entry);
                        break;
                }

                if (needDelete) {
                    if (window.confirm('Delete loaded '+ entries + '?')) {
                        selected.removeObject(entry);
                    }
                }
                else {
                    selected.removeObject(entry);
                }

            }

        }

    }

});