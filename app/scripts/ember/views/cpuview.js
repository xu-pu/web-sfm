'use strict';

App.CpuSettingView = Ember.View.extend({

    templateName: 'widgets/cpu-setting',

    tagName: 'div',

    classNames: [
        'controll-panel__cpu-setting'
    ],

    hoverAt: 4,

    selected: 4,

    onChangeSetting: function(){
        this.controller.set('threadPoolSize', this.get('selected'));
    }.observes('selected'),

    NodeView: Ember.View.extend({

        templateName: 'widgets/cpu-node',

        tagName: 'div',

        classNames: [
            'controll-panel__cpu-setting__node'
        ],

        index: null,

        isEnabled: function(){
            return this.get('index') < this.get('parentView').get('selected');
        }.property('parentView.selected'),

        willEnable: function(){
            return (!this.get('isEnabled')) && (this.get('index') <= this.get('parentView').get('hoverAt'));
        }.property('isEnabled', 'parentView.hoverAt'),

        willDisable: function(){
            return this.get('isEnabled') && (this.get('index') > this.get('parentView').get('hoverAt'));
        }.property('isEnabled', 'parentView.hoverAt'),

        mouseEnter: function(){
            this.get('parentView').set('hoverAt', this.get('index'));
        },

        click: function(){
            this.get('parentView').set('selected', this.get('index')+1);
        }

    })

});