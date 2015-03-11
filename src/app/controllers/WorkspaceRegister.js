'use strict';

module.exports = Ember.Controller.extend({

    focus: null,

    actions: {
        focus: function(cam){
            this.set('focus', cam);
        }
    }

});