'use strict';

App.TwoViewGridView = Ember.View.extend({

    tagName: 'table',

    classNames: [
        'main-container__match-table'
    ],

    hover: null,

    templateName: 'widgets/twoviewgrid',

    NodeView: Ember.View.extend({

        tagName: 'th',

        mouseEnter: function(){
            this.get('parentView').set('hover', this);
        },

        isHorizontal: function(){
            return this.get('parentView.hover.indexY') === this.get('indexY') && this.get('parentView.hover.indexX') > this.get('indexX');
        }.property('parentView.hover'),

        isVertical: function(){
            return this.get('parentView.hover.indexX') === this.get('indexX') && this.get('parentView.hover.indexY') > this.get('indexY');
        }.property('parentView.hover'),

        viewX: null,

        viewY: null,

        indexX: function(){
            return this.get('controller.images').indexOf(this.get('viewX'));
        }.property('viewX'),

        indexY: function(){
            return this.get('controller.images').indexOf(this.get('viewY'));
        }.property('viewY'),

        isFinished: false,

        isInProgress: false
    })

});