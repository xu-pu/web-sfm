"use strict";


function websiftTest(imgName){

    getImageSample(imgName, function(img){
        var data = getImageData(img);
        console.log(data.width);
        console.log(data.height);
        /*
        var siftworker = new Worker(SFM.SIFT_WORKER);
        siftworker.onmessage = function(e){
            console.log(e.data);
        };
        siftworker.postMessage(data);
    */
        var gray = new SFM.Grayscale({ canvas: data });
        var result = SFM.sift(gray);
        console.log(result);

    });

}

function twoViewMatchTest(imgName1, imgName2){
    if (imgName1 === imgName2) {
        throw 'images must be different';
    }
    getSiftPair(imgName1, imgName2, function(features1, features2){
        getImageSample(imgName1, function(img1){
            getImageSample(imgName2, function(img2){
                var matches = localStorage.getItem('matchingbuffer');
                if (matches) {
                    matches = JSON.parse(matches);
                    console.log('matching loaded');
                }
                else {
                    console.log('matching begins');
                    matches = SFM.twoViewMatch(features1, features2, 0.7);
                    console.log('matching ended');
                    localStorage.setItem('matchingbuffer', JSON.stringify(matches));
                }
                var fixedWidth = 600;
                var ratio1 = fixedWidth/img1.width,
                    ratio2 = fixedWidth/img2.width,
                    height1 = img1.height*ratio1,
                    height2 = img2.height*ratio2;
                var canvas = document.createElement('canvas');
                canvas.width = fixedWidth;
                canvas.height = height1+height2;
                document.body.appendChild(canvas);
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img1, 0, 0, fixedWidth, height1);
                ctx.drawImage(img2, 0, height1, fixedWidth, height2);

                drawFeatures(ctx, _.map(matches, function(match){
                    return features1[match[0]];
                }), 0, 0, img1.height, ratio1);

                drawFeatures(ctx, _.map(matches, function(match){
                    return features2[match[1]];
                }), 0, ratio1*img1.height, img2.height, ratio2, { color: 'green' });

                ctx.beginPath();
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                _.each(matches, function(match){
                    var row1 = features1[match[0]].row,
                        col1 = features1[match[0]].col,
                        row2 = features2[match[1]].row,
                        col2 = features2[match[1]].col;
                    var x1 = ratio1*col1,
                        y1 = ratio1*(img1.height-1-row1),
                        x2 = ratio2*col2,
                        y2 = ratio2*(img2.height-1-row2)+height1;
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                });
                ctx.stroke();
            })
        })
    })

}

function siftTest(imageName){
    console.log('invoked');
    getImageSample(imageName, function(img){
        console.log('image loaded');
        getSiftSample(imageName, function(data){
            console.log('sift loaded');
            var canvas = getImageCanvas(img);
            var ctx = canvas.getContext('2d');
            drawSift(ctx, img, data.features);
            document.body.appendChild(canvas);
        })
    })
}

function eightPointTest(name1, name2){
    getTwoViewPair(name1, name2, function(img1, img2, features1, features2){
        var matches = JSON.parse(localStorage.getItem('matchingbuffer'));
        var F = SFM.eightPoint(_.sample(matches, 8), { cam1: img1, cam2: img2, features1: features1, features2: features2 });
        console.log(F);
        var errors = _.map(matches, function(match){
            var p1 = SFM.RCtoImg(features1[match[0]].row, features1[match[0]].col, img1.width, img1.height),
                p2 = SFM.RCtoImg(features2[match[1]].row, features2[match[1]].col, img2.width, img2.height);
            return Math.abs(p1.transpose().dot(F).dot(p2));
        });
    });
}

function eightPointRansacTest(name1, name2){
    getTwoViewPair(name1, name2, function(img1, img2, features1, features2){
        var matches = JSON.parse(localStorage.getItem('matchingbuffer'));

        var metadata = {
            features1: features1,
            features2: features2,
            cam1: img1,
            cam2: img2
        };

        var result = SFM.ransac({
            dataset: matches,
            metadata: metadata,
            subset: 8,
            relGenerator: SFM.eightPoint,
            errorGenerator: SFM.fundamentalMatrixError,
            outlierThreshold: 0.5,
            errorThreshold: 0.5,
            trials: 1000
        });

        console.log(result);

        drawTwoViewMatches(img1, img2, features1, features2, result.dataset);

    });
}

$(function(){

    promiseImageDataSample('00000001').then(function(data){
        console.log(data);
        return data;
    }).then(function(data){
        
    });

});