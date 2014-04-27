'use strict';

App.ApplicationController = Ember.Controller.extend({

    actions: {
        enter: function(route){
            this.transitionToRoute(route);
        }
    }

});


App.InputController = Ember.ArrayController.extend({
    itemController: 'image'
});

App.ImageController = Ember.ObjectController.extend({


});