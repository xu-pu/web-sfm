'use strict';

module.exports = Ember.ObjectController.extend({

    needs: ['demos'],

    demoController: null,

    isInprogress: Ember.computed.alias('demoController.isInprogress'),

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
            if (this.get('isInprogress')) {
                return;
            }
            if (this.get('selectedImage') && this.get('loadedImages').length != 0) {
                if (window.confirm('Delete loaded images?')) {
                    this.get('model').toggleImage();
                }
            }
            else {
                this.get('model').toggleImage();
            }
        },

        toggleFeature: function(){
            if (this.get('isInprogress')) {
                return;
            }
            if (this.get('selectedFeature') && this.get('loadedFeatures').length != 0) {
                if (window.confirm('Delete loaded features?')) {
                    this.get('model').toggleFeature();
                }
            }
            else {
                this.get('model').toggleFeature();
            }
        },

        toggleMatch: function(){
            if (this.get('isInprogress')) {
                return;
            }
            this.get('model').toggleMatch();
        },

        toggleCalibration: function(){
            if (this.get('isInprogress')) {
                return;
            }
            if (this.get('selectedCalibration') && this.get('calibrationLoaded')) {
                if (window.confirm('Delete loaded calibration information?')) {
                    this.get('model').toggleCalibration();
                }
            }
            else {
                this.get('model').toggleCalibration();
            }
        },

        toggleMVS: function(){
            if (this.get('isInprogress')) {
                return;
            }
            if (this.get('selectedMVS') && this.get('mvsLoaded')) {
                if (window.confirm('Delete loaded Multi-View Stereo data?')) {
                    this.get('model').toggleMVS();
                }
            }
            else {
                this.get('model').toggleMVS();
            }
        }

    }

});