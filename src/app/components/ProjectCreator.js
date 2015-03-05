'use strict';

var Project = require('../models/Project.js');

module.exports = Ember.Component.extend({

    ctx: null, // need

    tagName: 'div',

    classNames: 'welcome-screen__projects__new',

    classNameBindings: ['isInvalid'],

    defaultName: 'my-project',

    newProjectName: '',

    isInvalid: function(){
        var name = this.get('newProjectName'),
            ctx = this.get('ctx'),
            isValid = ctx.nameAvaliable(name) || name === '';
        return !isValid;
    }.property('newProjectName'),

    actions: {

        createProject: function(){

            var defaultName = this.get('defaultName'),
                name = this.get('newProjectName'),
                ctx = this.get('ctx');

            if (!this.get('isInvalid')) {
                if (name === '') {
                    name = getNextDefaultName();
                }
                var project = Project.create({ name: name });
                ctx.send('createProject', project);
            }

            function getNextDefaultName(i){
                if (i) {
                    var name = defaultName+'-'+i;
                    return ctx.nameAvaliable(name) ? name : getNextDefaultName(i+1);
                }
                else {
                    return ctx.nameAvaliable(defaultName) ? defaultName : getNextDefaultName(2);
                }
            }

        }

    }


});