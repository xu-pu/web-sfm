module.exports = Ember.Component.extend({

    classNames: ['match-mode-tab'],

    classNameBindings: ['isCurrent'],

    isCurrent: function(){
        return this.get('current') === this.get('mode');
    }.property('current', 'mode'),

    click: function(){
        this.set('current', this.get('mode'))
    }

});