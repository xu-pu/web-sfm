'use strict';

module.exports = Ember.ObjectController.extend({

    needs: ['workspace'],

    images: Ember.computed.alias('model.images')

});