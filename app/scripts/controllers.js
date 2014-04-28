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

App.ThumbnailController = Ember.ObjectController.extend({

    actions: {
        expand: function(){
            this.transitionToRoute('images', this.get('model'));
        }
    }

});

App.ImagesController = Ember.ObjectController.extend();