var sfmstore = require('../store/sfmstore.js');

module.exports = Ember.Route.extend({

    model: function(){
        return Promise.all([
            sfmstore.promiseDemos(),
            sfmstore.promiseProjects(),
        ]).then(function(results){
            return {
                demos: results[0],
                projects: results[1]
            }
        });
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