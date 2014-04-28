'use strict';

App.ApplicationController = Ember.Controller.extend({

    actions: {
        enter: function(route){
            this.transitionToRoute(route);
        }
    }

});


App.InputController = Ember.ArrayController.extend({
    itemController: 'thumbnail'
});

App.InputImagesController = Ember.ArrayController.extend({
    itemController: 'thumbnail'
});


App.ThumbnailController = Ember.ObjectController.extend();