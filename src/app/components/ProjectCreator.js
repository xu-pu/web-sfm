'use strict';

var Project = require('../models/Project.js');

module.exports = Ember.Component.extend({

    ctx: null, // need

    tagName: 'div',

    classNames: 'welcome-screen__projects__new',

    classNameBindings: ['isInvalid'],

    newProjectName: '',

    isInvalid: function(){
        var name = this.get('newProjectName'),
            ctx = this.get('ctx'),
            isValid = name !== '' && ctx.nameAvaliable(name);
        return !isValid;
    }.property('newProjectName'),

    actions: {

        createProject: function(){
            if (!this.get('isInvalid')) {
                var project = Project.create({ name: this.get('newProjectName') });
                this.get('ctx').send('createProject', project);
            }
        }

    }


});