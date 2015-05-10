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

    downloader: Ember.inject.service(),

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

        var root = this.get('root'),
            downloader = this.get('downloader');

        var url, datatype, desc;

        switch (name) {
            case RESOURCE.IMAGES:
                url = root+name;
                datatype = 'json';
                desc = 'Download image list';
                break;
            case RESOURCE.FULLIMAGES:
                // metadata is the Image object
                url = root+'/images/'+metadata.get('name')+metadata.get('extension');
                datatype = 'arraybuffer';
                desc = metadata.get('name')+metadata.get('extension');
                break;
            case RESOURCE.FEATURE_POINTS:
                // metadata is the Image object
                url = root+name+'/'+metadata.get('name')+'.point';
                datatype = 'arraybuffer';
                desc = metadata.get('name')+'.points';
                break;
            case RESOURCE.FEATURE_VECTORS:
                // metadata is the Image object
                url = root+name+'/'+metadata.get('name')+'.vector';
                datatype = 'arraybuffer';
                desc = metadata.get('name')+'.vector';
                break;
            case RESOURCE.RAW_MATCHES:
                url = root+name;
                datatype = 'json';
                desc = 'Loading raw match table';
                break;
            case RESOURCE.ROBUST_MATCHES:
                // metadata is the Image object
                url = root+name;
                datatype = 'json';
                desc = 'Loading robust match table';
                break;
            case RESOURCE.MVS_POINTS:
                url = root+name;
                datatype = 'arraybuffer';
                desc = 'Dense point cloud';
                break;
            case RESOURCE.MVS_COLORS:
                url = root+name;
                datatype = 'arraybuffer';
                desc = 'Dense point cloud texture';
                break;
            case RESOURCE.SPARSE_POINTS:
                url = root+name;
                datatype = 'arraybuffer';
                desc = 'Sparse point cloud';
                break;
            case RESOURCE.SPARSE_COLORS:
                url = root+name;
                datatype = 'arraybuffer';
                desc = 'Sparse point cloud texture';
                break;
            case RESOURCE.CAMERAS:
                url = root+name;
                datatype = 'json';
                desc = 'Loading camera parameters';
                break;
            default:
                throw 'Invalid resource';
        }

        return downloader.assign(url, datatype, desc).get('promise');

    },

    promiseLocalResource: function(name, metadata){

        var adapter = this.get('adapter');

        switch (name) {
            case RESOURCE.IMAGES:
                return adapter
                    .promiseAll(name)
                    .then(function(results){
                        return results.map(function(entry){
                            var key = entry.key;
                            var value = entry.value;
                            value.id = key;
                            return value;
                        });
                    });
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