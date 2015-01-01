'use strict';

module.exports = Ember.ObjectController.extend({

    needs: ['demos'],

    demoController: null,

    onDemoChange: function(){
        var demos = this.get('controllers.demos'),
            name = this.get('model.name');
        this.set('demoController', demos.findBy('name', name));
    }.observes('model'),

    actions: {

        toggleFeature: function(){
            this.get('demoController').send('toggleFeature');
        },

        toggleMatch: function(){
            this.get('demoController').send('toggleMatch');
        },

        toggleCalibration: function(){
            this.get('demoController').send('toggleCalibration');
        },

        toggleMVS: function(){
            this.get('demoController').send('toggleMVS');
        }

    }

});