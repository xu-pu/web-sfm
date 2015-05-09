module.exports = Ember.Component.extend({

    messages: Ember.inject.service(),

    queue: Ember.computed.alias('messages.queue'),

    message: null, // need

    tagName: 'li',

    classNames: 'basic-message',

    actions: {

        dismiss: function(){
            var message = this.get('message');
            var queue = this.get('queue');
            queue.removeObject(message);
        }

    }

});