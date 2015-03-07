'use strict';

var settings = require('../settings.js'),
    RESOURCE = settings.RESOURCE;

module.exports = Ember.Component.extend({

    classNames: ['image-detail__container'],

    image: null, // need

    resource: null, // need

    isLoadng: true,

    dataurl: null,

    onNewImage: function(){

        this.set('isLoading', true);

        var _self = this;

        return this.get('resource')
            .promiseResource(RESOURCE.FULLIMAGES, this.get('image'))
            .then(function(data){
                var domstring = URL.createObjectURL(new Blob([data]));
                _self.set('dataurl', domstring);
                _self.set('isLoading', false);
            });

    }.observes('image').on('init')

});