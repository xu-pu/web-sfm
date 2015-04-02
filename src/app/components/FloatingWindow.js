module.exports = Ember.Component.extend({

    actions: {
        close: function(){
            this.sendAction('close');
        }
    }

});