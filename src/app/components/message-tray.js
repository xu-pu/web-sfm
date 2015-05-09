module.exports = Ember.Component.extend({

    messages: Ember.inject.service(),

    queue: Ember.computed.alias('messages.queue'),

    tagName: 'div',

    classNames: 'message-tray'

});