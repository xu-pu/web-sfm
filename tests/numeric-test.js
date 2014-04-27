$(function(){

    "use strict";

    var imageSamples = ['00000010', '00000020', '00000030'];
    SFM.DATA.cameras[0] = { width:3008, height:2000 };
    SFM.DATA.cameras[1] = { width:3008, height:2000 };
    SFM.DATA.cameras[2] = { width:3008, height:2000 };
    imageSamples.forEach(function(name, index){
        getSiftSample(name, function(data){
            console.log('features of ' + index + 'loaded');
            SFM.DATA.features[index] = data.features;
            if (SFM.DATA.features[0] && SFM.DATA.features[1]) {
                test();
            }
        });
    });


    function test(){
        var matches, fmatrix;
        if (localStorage.getItem('matchtest') === null) {
            matches = SFM.bruteforceTwoViewMatch(0,1);
            localStorage.setItem('matchtest', JSON.stringify(matches));
        }
        else {
            matches = JSON.parse(localStorage.getItem('matchtest'));
        }
        if (matches.length >= 8) {
            fmatrix = SFM.eightPointAlgorithm(0,1,matches.slice(0,8));
            console.log(fmatrix);
        }
        else {
            throw "insufficient matches";
        }

    }
});


