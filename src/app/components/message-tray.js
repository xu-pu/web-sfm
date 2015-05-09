module.exports = Ember.Component.extend({

    messages: Ember.inject.service(),

    queue: Ember.computed.alias('messages.queue'),

    tagName: 'div',

    classNames: 'message-tray',

    expanded: true,

    actions: {

        expand: function(){
            if (this.get('queue.length') > 0) {
                this.set('expanded', true);
            }
        },

        close: function(){
            this.set('expanded', false);
        }

    }

});