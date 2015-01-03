'use strict';

var _ = require('underscore');

var utils = require('../utils.js');

module.exports = Ember.View.extend({

    attributeBindings: ['style'],

    classNames: ['welcome-screen__detail-body'],

    classNameBindings: ['isExpanded'],

    isExpanded: false,

    style: function(){
        return 'background-image: url(' + this.get('controller.root') + '/profile.png)';
    }.property('controller.root'),

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
                _self.get('controller').transitionToRoute('welcome');
            });
        }

    }

});