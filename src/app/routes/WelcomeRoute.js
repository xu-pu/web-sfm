'use strict';

module.exports = Ember.Route.extend({

    model: function(){
        var sfmstore = this.controllerFor('sfmStore');
        return {
            demos: sfmstore.get('demos'),
            projects: sfmstore.get('projects')
        };
    },

    setupController: function(controller, model){
        this._super(controller, model);
        this.controllerFor('demos').set('model', model.demos);
        this.controllerFor('projects').set('model', model.projects);
    },

    renderTemplate: function(){
        this._super();
        this.render('welcome/demos', {
            into: 'welcome',
            outlet: 'demos',
            controller: 'demos'
        });
        this.render('welcome/projects', {
            into: 'welcome',
            outlet: 'projects',
            controller: 'projects'
        });
    }

});