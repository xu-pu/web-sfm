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

    urlBase: function(){
        return '/Demos/' + this.get('name');
    }.property('name'),

    resume: function(){
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
        Promise.all([
            imagesResumed,
            siftResumed,
            bundlerResumed,
            mvsResumed
        ]).then(function(){

        });
    },

    download: function(){
        // always after resume
        var _self = this;
        var adapter = this.get('adapter');
        Promise.all([
            this.promiseDownloadImages(),
            this.promiseDownloadSIFT(),
            this.promiseDownloadBundler(),
            this.promiseDownloadMVS()
        ]).then(function(){

        });
    },


    promiseDownloadImages: function(){
        return new Promise(function(resolve, reject){
            _.without(this.get('images'), this.get('finishedImages')).forEach(function(imageName){
                App.Utils.promiseLoadImage();
            });
        });
    },


    promiseDownloadSIFT: function(){
        return new Promise(function(resolve, reject){});
    },


    promiseDownloadBundler: function(){
        return new Promise(function(resolve, reject){});
    },


    promiseDownloadMVS: function(){
        return new Promise(function(resolve, reject){});
    }

});