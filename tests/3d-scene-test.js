"use strict";

$(function(){
//    $.getJSON('/dataset/mvs/option.txt.pset.json').then(function(data){
//        showParticles(data);
//    });

//    showParticles();
    getBundlerSample(function(data){
        console.log('data loaded');
        drawBundler(data);
    });


});
