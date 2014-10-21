'use strict';

module.exports = Ember.ObjectController.extend({

    needs: ['application'],

    store: Ember.computed.alias('controllers.application.model'),

    isDeleting: false,

    actions: {
        deleteProject: function(){
            this.promiseDelete()
        }
    },

    promiseDelete: function(){
        var _self = this,
            project = this.get('model'),
            store = this.get('store'),
            currentProject = store.get('currentProject');
        if (currentProject && currentProject.get('name') === project.get('name')) {
            store.set('currentProject', null);
        }
        return new Promise(function(resolve, reject){
            _self.set('isDeleting', true);
            var request = indexedDB.deleteDatabase(project.get('name'));
            request.onsuccess = function(){
                store.get('projects').removeObject(project);
                resolve(project);
            };
        });
    }

});