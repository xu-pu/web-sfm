'use strict';

App.FullsizeImageView = Ember.View.extend({

    loadng: true,

    dataurl: null,

    didInsertElement: function(){
        this.onNewImage();
        this.controller.addObserver('model', this, this.onNewImage);
    },

    onNewImage: function(){
        var _self = this;
        this.set('loading', true);
        IDBAdapter.promiseData('fullimages', this.controller.get('_id')).then(function(data){
            _self.set('dataurl', data);
            _self.set('loading', false);
        });
    }

});