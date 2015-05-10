'use strict';

var utils = require('../utils.js'),
    settings = require('../settings.js'),
    RESOURCE = settings.RESOURCE,
    Image = require('../models/Image.js');

module.exports = Ember.Controller.extend({

    needs: ['context'],

    ctx: Ember.computed.alias('controllers.context'),

    model: Ember.computed.alias('project'),

    project: Ember.computed.alias('ctx.currentProject'),

    root: Ember.computed.alias('model.root'),

    adapter: Ember.computed.alias('ctx.adapter'),

    isDemo: Ember.computed.alias('model.isDemo'),

    promiseResource: function(name, metadata){
        var project = this.get('project');
        if (project.get('isDemo')) {
            return this.promiseDemoResource(name, metadata);
        }
        else {
            return this.promiseLocalResource(name, metadata);
        }
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
                // metadata is the Image object
                return utils.promiseDownload(root+'/images/'+metadata.get('name')+metadata.get('extension'), 'arraybuffer');
                break;
            case RESOURCE.FEATURES:
                // metadata is the Image object
                return utils.promiseDownload(root+'/sift.json/'+metadata.get('name')+'.json', 'json');
                break;
            case RESOURCE.FEATURE_POINTS:
                // metadata is the Image object
                return utils.promiseDownload(root+name+'/'+metadata.get('name')+'.point', 'arraybuffer');
                break;
            case RESOURCE.FEATURE_VECTORS:
                // metadata is the Image object
                return utils.promiseDownload(root+name+'/'+metadata.get('name')+'.vector', 'arraybuffer');
                break;
            case RESOURCE.RAW_MATCHES:
                return utils.promiseDownload(root+name, 'json');
                break;
            case RESOURCE.ROBUST_MATCHES:
                // metadata is the Image object
                return utils.promiseDownload(root+name, 'json');
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

    },

    promiseLocalResource: function(name, metadata){

        var adapter = this.get('adapter');

        switch (name) {
            case RESOURCE.IMAGES:
                return adapter.promiseAll(name);
                break;
            case RESOURCE.FULLIMAGES:
                // metadata is the Image object
                return adapter.promiseData(name, metadata.get('id'));
                break;
            default:
                throw 'Invalid resource';
        }

    }


});