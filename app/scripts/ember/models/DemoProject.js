App.DemoProject = Ember.Object.extend({

    name: null,

    imageNames: null,

    loaded: false,

    imageProgress: 0,

    siftProgress: 0,

    adapter: null,

    finishedImages: [],

    finishedSIFT: [],

    finishedBundler: false,

    finishedMVS: false,

    init: function(){
        Ember.Logger.debug('project storage adapter created');
        var adapter = new App.StorageAdapter(this.get('name'));
        this.set('adapter', adapter);
    },

    leftImages: function(){
        return _.difference(this.get('images'), this.get('finishedImages'));
    }.property('finishedImages'),

    leftSIFT: function(){
        return _.difference(this.get('images'), this.get('finishedSIFT'));
    }.property('finishedSIFT'),

    urlBase: function(){
//        return '/Demos/' + this.get('name');
        return '/dataset';
    }.property('name'),

    promiseProjectReady: function(){
//        return this.promiseResume().then(this.promiseDownload);
        return this.promiseDownload();
    },

    promiseResume: function(){
        var _self = this;
        var adapter = new App.StorageAdapter(this.get('name'));
        this.set('adapter', adapter);
        var mvsResumed = adapter.promiseData(SFM.STORE_SINGLETONS, SFM.STORE_MVS).then(function(){
            _self.set('finishedMVS', true);
        }, function(){
            _self.set('finishedMVS', false);
        });
        var bundlerResumed = adapter.promiseData(SFM.STORE_SINGLETONS, SFM.STORE_BUNDLER).then(function(){
            _self.set('finishedBundler', true);
        }, function(){
            _self.set('finishedBundler', false);
        });
        var siftResumed = adapter.promiseAll(SFM.STORE_FEATURES).then(function(features){

        });
        var imagesResumed = adapter.promiseAll(SFM.STORE_IMAGES).then(function(images){

        });
        return Promise.all([
            imagesResumed,
            siftResumed,
            bundlerResumed,
            mvsResumed
        ]);
    },


    promiseDownload: function(){
        return this.promiseDownloadImages();
//            .then(this.promiseDownloadSIFT)
//            .then(this.promiseDownloadBundler)
//            .then(this.promiseDownloadMVS);
    },


    promiseDownloadImages: function(){
        return Promise.all(this.get('leftImages').map(this.promiseProcessOneImage.bind(this)));
    },


    promiseProcessOneImage: function(name){
        var rawName = name.split('.')[0],
            urlBase = this.get('urlBase'),
            adapter = this.get('adapter'),
            finishedImages = this.get('finishedImages'),
            finishedSIFT = this.get('finishedSIFT');

        var imageUrl = urlBase + '/images/' + name,
            siftUrl = urlBase + '/sift.json/' + rawName + '.json';

        return App.Utils
            .requireImageFile(imageUrl)
            .then(function(blob){
                blob.name = name;
                return Promise.all([
                    adapter.processImageFile(blob),
                    App.Utils.promiseJSON(siftUrl)
                ]);
            })
            .then(function(results){
                finishedImages.addObject(name);
                var _id = results[0],
                    sift = results[1].features;
                return adapter.promiseSetData(SFM.STORE_FEATURES, _id, sift);
            })
            .then(function(){
                finishedSIFT.addObject(name);
            });
    },

    promiseDownloadBundler: function(){
        return App.Utils.requireJSON(this.get('urlBase')+'/bundler/bundler.json');
    },

    promiseDownloadMVS: function(){
        var adapter = this.get('adapter');
        var url = this.get('urlBase')+'/mvs/option.txt.pset.json';
        return App.Utils.requireJSON(url).then(function(data){
            return adapter.promiseSetData(SFM.STORE_SINGLETONS, SFM.STORE_MVS, data);
        });
    }

});