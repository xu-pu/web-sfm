'use strict';

module.exports = Ember.Component.extend({

    tagName: 'ul',

    classNames: 'image-gallery',

    canImport: false,

    actions: {
        expand: function(item){
            this.sendAction('expand', item);
        }
    }

});