module.exports = Ember.Service.extend({

    queue: [],

    resume: function(){
        this.get('queue').pushObject({
            content: 'this is a message'
        });
        this.get('queue').pushObject({
            content: 'this is a message'
        });
    }.on('init')

});