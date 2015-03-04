'use strict';

var utils = require('../utils.js'),
    settings = require('../settings.js'),
    RESOURCE = settings.RESOURCE;

module.exports = Ember.Controller.extend({

    needs: ['context'],

    context: Ember.computed.alias('controllers.context'),

    model: Ember.computed.alias('context.currentProject'),

    root: Ember.computed.alias('model.root'),

    promiseResource: function(name, metadata){
        //!!todo
        return this.promiseDemoResource(name, metadata);
    },

    promiseDemoResource: function(name, metadata){

        if (!this.get('model') || !this.get('model.isDemo')) {
            throw 'Demo object invalid';
        }

        var root = this.get('root');

        switch (name) {
            case RESOURCE.IMAGES:
                return utils.promiseDownload(root+name, 'json');
                break;
            case RESOURCE.FULLIMAGES:
                // metadata is the image object in demo description
                return utils.promiseDownload(root+name+metadata.name+metadata.extension, 'arraybuffer');
                break;
            case RESOURCE.MVS_POINTS:
                return utils.promiseDownload(root+name, 'arraybuffer');
                break;
            case RESOURCE.MVS_COLORS:
                return utils.promiseDownload(root+name, 'arraybuffer');
                break;
            case RESOURCE.SPARSE_POINTS:
                return utils.promiseDownload(root+name, 'arraybuffer');
                break;
            case RESOURCE.SPARSE_COLORS:
                return utils.promiseDownload(root+name, 'arraybuffer');
                break;
            case RESOURCE.CAMERAS:
                return utils.promiseDownload(root+name, 'json');
                break;
            default:
                throw 'Invalid resource';
        }

    }

});