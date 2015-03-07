'use strict';

var _ = require('underscore');

var utils = require('../utils.js');

module.exports = Ember.Component.extend({

    project: null, // need

    ctx: null, // need

    attributeBindings: ['style'],

    classNames: ['welcome-screen__detail-body'],

    classNameBindings: ['isExpanded'],

    isExpanded: false,

    style: function(){
        return 'background-image: url(' + this.get('project.root') + '/profile.png)';
    }.property('project.root'),

    inflate: function(){
        var _self = this;
        return utils
            .promiseDelay(0)
            .then(function(){
                _self.set('isExpanded', true);
            });
    }.on('didInsertElement'),

    actions: {

        close: function(){
            var _self = this;
            this.set('isExpanded', false);
            utils.promiseDelay(500).then(function(){
                _self.get('ctx').transitionToRoute('welcome');
            });
        },

        enter: function(){
            this.get('ctx').send('enter', this.get('project'));
        }

    }

});