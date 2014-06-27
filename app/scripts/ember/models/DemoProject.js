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
        return this.promiseDownloadImages()
            .then(this.promiseDownloadSIFT)
            .then(this.promiseDownloadBundler)
            .then(this.promiseDownloadMVS);
    },


    promiseDownloadImages: function(){

        var urlBase = this.get('urlBase') + '/images';

        return Promise.all(this.get('leftImages').map(promiseOne));

        function promiseOne(name){
            return App.Utils.requireImg(urlBase + '/' + name + '.jpg')
                .then(promiseStoreImage);

        }

        function promiseStoreImage(img){

        }

    },


    promiseDownloadSIFT: function(){

        var baseUrl = this.get('urlBase') + '/sift.json/';

        return Promise.all(this.get('leftSIFT').map(promiseOne));

        function promiseOne(name){
            return App.Utils.requireJSON(baseUrl + name + '.json');
        }

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