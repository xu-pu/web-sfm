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

        toggleImage: function(){
            this.get('demoController').toggleProperty('selectedImage');
        },

        toggleFeature: function(){
            if (this.get('hasFeature')) {
                this.get('demoController').toggleProperty('selectedFeature');
            }
        },

        toggleMatch: function(){
            if (this.get('hasMatch')) {
                this.get('demoController').toggleProperty('selectedMatch');
            }
        },

        toggleCalibration: function(){
            if (this.get('hasCalibration')) {
                this.get('demoController').toggleProperty('selectedCalibration');
            }
        },

        toggleMVS: function(){
            if (this.get('hasMVS')) {
                this.get('demoController').toggleProperty('selectedMVS');
            }
        }

    }

});