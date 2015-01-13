'use strict';

module.exports = Ember.View.extend({

    tagName: 'div',

    classNames: [
        'main-container__match-grid'
    ],

    hover: null,

    isTraced: function(){
        if (this.get('hover') === null) {
            return false;
        }
        else {
            return !this.get('hover.isDiag');
        }
    }.property('hover'),

    NodeView: Ember.View.extend({

        tagName: 'div',

        from: null,

        to: null,

        mouseEnter: function(){
            this.get('parentView').set('hover', this);
        },

        /*
        click: function(){
            this.get('controller').transitionToRoute('matcher.pair', { from: this.get('from'), to: this.get('to') });
        },
        */

        isTrace: function(){
            var hover = this.get('parentView.hover');
            if (!hover.get('isDiag')) {
                return this.get('from') === hover.get('from') || this.get('to') === hover.get('to');
            }
            else {
                return false;
            }
        }.property('parentView.hover'),

        isFinished: function(){
            return !this.get('isDiag') && this.get('controller.finished').indexOf(this.get('key')) !== -1;
        }.property('controller.matches.length', 'from', 'to'),

        isDiag: function(){
            return this.get('from') === this.get('to');
        }.property('from', 'to')

        /*
        isInprogress: function(){
            if (this.get('controller.scheduler')) {
                return this.get('controller.scheduler.inProgress').indexOf(this.get('key')) !== -1;
            }
            else {
                return false;
            }
        }.property('controller.scheduler.inProgress.length')
        */
    })

});