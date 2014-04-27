'use strict';

App.Router.map(function() {
    this.resource('input', function(){
        this.route('index');
        this.route('image', { path: '' })
    });
});


App.InputRoute = Ember.Route.extend({

    model: function(){
        return App.Data.images;
    }

});


App.InputIndexRoute = Ember.Route.extend({

    model: function(){
        return App.Data.images;
    }

});



App.InputImageRoute = Ember.Route.extend({

    model: function(){
        return App.Data.images;
    }

});
