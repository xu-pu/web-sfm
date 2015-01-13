'use strict';

module.exports = Ember.View.extend({

    tagName: 'div',

    classNames: [
        'main-container__match-grid'
    ],

    GridView: Ember.View.extend({

        tagName: 'div',

        classNames: ['match-grid__body'],

        hover: null,

        mouseLeave: function(){
            this.set('hover', null);
        },

        NodeView: Ember.View.extend({

            tagName: 'div',

            classNames: ['match-grid__node'],

            classNameBindings: ['isDiag', 'isTrace', 'isHover'],

            from: null,

            to: null,

            mouseEnter: function(){
                if (this.get('isDiag')) {
                    this.get('parentView').set('hover', null);
                }
                else {
                    this.get('parentView').set('hover', this);
                }
            },

            /*
             click: function(){
             this.get('controller').transitionToRoute('matcher.pair', { from: this.get('from'), to: this.get('to') });
             },
             */

            isTrace: function(){
                var hover = this.get('parentView.hover');
                if (!!hover && !hover.get('isDiag') && this!=hover) {
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
            }.property('from', 'to'),

            isHover: function(){
                return this === this.get('parentView.hover');
            }.property('parentView.hover')

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

    })

});