'use strict';

App.Utils = {};

App.Utils.promiseImage = function(id){
    return new Promise(function(resolve, reject){
        IDBAdapter.promiseData(SFM.STORE_FULLIMAGES, id).then(function(dataURL){
            var img = document.createElement('img');
            img.onload = function(){
                resolve(img);
            };
            img.src = dataURL
        }, reject);
    });
};