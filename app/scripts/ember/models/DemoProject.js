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

    leftImages: function(){
        return _.difference(this.get('images'), this.get('finishedImages'));
    }.property('finishedImages'),

    leftSIFT: function(){
        return _.difference(this.get('images'), this.get('finishedSIFT'));
    }.property('finishedSIFT'),

    urlBase: function(){
        return '/Demos/' + this.get('name');
    }.property('name'),

    promiseLoadProject: function(){
        return this.promiseResume()
            .then(this.promiseDownload);
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
        // always after resume
        return Promise.all([
            this.promiseDownloadImages(),
            this.promiseDownloadSIFT(),
            this.promiseDownloadBundler(),
            this.promiseDownloadMVS()
        ]);
    },


    promiseDownloadImages: function(){
        return Promise.all(this.get('leftImages').map(function(name){
            return App.Utils.promiseLoadImage(name);
        }));
    },


    promiseDownloadSIFT: function(){
        return Promise.all(this.get('leftSIFT').map(function(name){
            return App.Utils.promiseLoadImage(name);
        }));
    },


    promiseDownloadBundler: function(){
        return new Promise(function(resolve, reject){});
    },


    promiseDownloadMVS: function(){
        return new Promise(function(resolve, reject){});
    }

});