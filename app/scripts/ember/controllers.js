'use strict';

App.ApplicationController = Ember.Controller.extend({

    actions: {
        enter: function(route){
            this.transitionToRoute(route);
        }
    }

});


App.InputController = Ember.ArrayController.extend({
    itemController: 'input.thumbnail'
});

App.InputThumbnailController = Ember.ObjectController.extend({

    actions: {
        expand: function(){
            this.transitionToRoute('input.image', this.get('model'));
        }
    }

});

App.InputImageController = Ember.ObjectController.extend();

App.ExtractorController = Ember.ArrayController.extend({
    itemController: 'extractor.thumbnail'
});

App.ExtractorThumbnailController = Ember.ObjectController.extend({

    actions: {
        expand: function(){
            this.transitionToRoute('extractor.image', this.get('model'));
        }
    }

});