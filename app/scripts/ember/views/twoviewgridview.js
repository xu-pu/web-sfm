'use strict';

App.TwoViewGridView = Ember.View.extend({

    tagName: 'table',

    classNames: [
        'main-container__match-table'
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

    templateName: 'widgets/twoviewgrid',

    NodeView: Ember.View.extend({

        tagName: 'th',

        mouseEnter: function(){
            this.get('parentView').set('hover', this);
        },

        click: function(){
            //Ember.Logger.debug(this.get('view1'));
            this.controller.transitionToRoute('matches.pair', { view1: this.get('viewX'), view2: this.get('viewY') });
        },

        isHorizontal: function(){
            return this.get('parentView.isTraced') && this.get('parentView.hover.indexY') === this.get('indexY') && this.get('parentView.hover.indexX') > this.get('indexX');
        }.property('parentView.hover'),

        isVertical: function(){
            return this.get('parentView.isTraced') && this.get('parentView.hover.indexX') === this.get('indexX') && this.get('parentView.hover.indexY') > this.get('indexY');
        }.property('parentView.hover'),

        viewX: null,

        viewY: null,

        indexX: function(){
            return this.get('controller.images').indexOf(this.get('viewX'));
        }.property(),

        indexY: function(){
            return this.get('controller.images').indexOf(this.get('viewY'));
        }.property(),

        key: function(){
            var id1 = this.get('viewX').get('_id'),
                id2 = this.get('viewY').get('_id');
            if (id1>id2) {
                return id2 + '&' + id1;
            }
            else if (id1<id2) {
                return id1 + '&' + id2;
            }
            else {
                return null;
            }
        }.property(),

        isFinished: function(){
            return !this.get('isDiag') && this.get('controller.finished').indexOf(this.get('key')) !== -1;
        }.property('controller.finished.length', 'key'),

        isDiag: function(){
            return this.get('viewX') === this.get('viewY');
        }.property(),

        isInprogress: function(){
            if (this.get('controller.scheduler')) {
                return this.get('controller.scheduler.inProgress').indexOf(this.get('key')) !== -1;
            }
            else {
                return false;
            }
        }.property('controller.scheduler.inProgress.length')

    })

});