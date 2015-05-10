'use strict';

module.exports = Ember.Component.extend({

    workspace: null, // need

    tagName: 'aside',

    elementId: 'controll-panel',

    expandInput: true,

    expandProgress: true,

    expandRegister: true,

    expandStereo: true,

    actions: {

        close: function(){
            this.get('workspace').send('back');
        },

        enter: function(target){
            this.get('workspace').send('enter', target);
        },

        toggleMenu: function(name){
            switch (name) {
                case 'input':
                    this.toggleProperty('expandInput');
                    break;
                case 'progress':
                    this.toggleProperty('expandProgress');
                    break;
                case 'register':
                    this.toggleProperty('expandRegister');
                    break;
                case 'stereo':
                    this.toggleProperty('expandStereo');
                    break;
                default:
                    throw "invalid menu toggle";
            }
        }

    }


});