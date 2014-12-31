'use strict';

module.exports = Ember.ObjectController.extend({

    needs: ['context'],

    context: Ember.computed.alias('controllers.context'),

    isDeleting: false,

    isConfirmDelete: false,

    actions: {

        'delete': function(){
            this.set('isConfirmDelete', false);
            this.promiseDelete();
        }

    },

    promiseDelete: function(){

        var _self = this,
            project = this.get('model'),
            context = this.get('context'),
            currentProject = context.get('currentProject');

        if (currentProject && currentProject.get('name') === project.get('name')) {
            context.set('currentProject', null);
        }

        return new Promise(function(resolve, reject){
            _self.set('isDeleting', true);
            var request = indexedDB.deleteDatabase(project.get('name'));
            request.onsuccess = function(){
                context.get('projects').removeObject(project);
                resolve(project);
            };
        });

    }

});