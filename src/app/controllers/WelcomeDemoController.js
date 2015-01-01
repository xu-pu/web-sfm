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
            if (this.get('hasFeature')) {
                this.get('demoController').send('toggleFeature');
            }
        },

        toggleMatch: function(){
            if (this.get('hasMatch')) {
                this.get('demoController').send('toggleMatch');
            }
        },

        toggleCalibration: function(){
            if (this.get('hasCalibration')) {
                this.get('demoController').send('toggleCalibration');
            }
        },

        toggleMVS: function(){
            if (this.get('hasMVS')) {
                this.get('demoController').send('toggleMVS');
            }
        }

    }

});