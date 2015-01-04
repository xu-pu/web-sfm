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

        download: function(){
            this.get('demoController').send('download');
        },

        toggleImage: function(){
            this.get('model').toggleImage();
        },

        toggleFeature: function(){
            this.get('model').toggleFeature();
        },

        toggleMatch: function(){
            this.get('model').toggleMatch();
        },

        toggleCalibration: function(){
            this.get('model').toggleCalibration();
        },

        toggleMVS: function(){
            this.get('model').toggleMVS();
        }

    }

});