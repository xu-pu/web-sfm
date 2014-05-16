'use strict';

/**
 *
 * @param {string} imageName
 * @param {function} callback
 */
function getSiftSample(imageName, callback) {
    $.getJSON('/dataset/sift.json/'+imageName+'.json').done(callback);
}

function getSiftPair(name1, name2, callback) {
    getSiftSample(name1, function(data1){
        getSiftSample(name2, function(data2){
            callback(data1.features, data2.features);
        })
    })
}

function getTwoViewPair(name1, name2, callback){
    console.log('two view pair loading');
    getSiftSample(name1, function(data1){
        getSiftSample(name2, function(data2){
            getImageSample(name1, function(img1){
                getImageSample(name2, function(img2){
                    console.log('two view pair loaded');
                    callback(img1, img2, data1.features, data2.features);
                });
            });
        })
    })
}

function getImageSample(imageName, callback){
    var img = document.createElement('img');
    img.onload = function(){
        callback(img);
    };
    img.src = '/dataset/images/'+imageName+'.jpg';
}


function getBundlerSample(callback){
    $.getJSON('/dataset/bundler/bundler.json').then(callback);
}

function bundlerViewList(data){
    var result = [];
    data.points.forEach(function(p, index){
        p.views.forEach(function(v){
            if(result[v.view]){
                result[v.view].push(index);
            }
            else {
                result[v.view] = [index];

            }
        });
    });
    return result;
}

function processCameraSample(cam){
    cam.R = SFM.M(cam1.R);
    cam.t = SFM.M([cam.t]).transpose();
    cam.width = 3000;
    cam.height = 2000;
    cam.P = SFM.getProjectionMatrix(cam.R, cam.t, cam.focal, cam.width, cam.height);
}