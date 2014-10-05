module.exports = drawImagePair;

/**
 * @typedef  {{alignX: boolean, ratio1: number, ratio2: number, padding: number, offsetX: number, offsetY: number, cam1: Camera, cam2: Camera}} TwoImageConfig
 */

/**
 * @param img1
 * @param img2
 * @param canvas
 * @param fixedWidth
 * @returns {TwoImageConfig}
 */
function drawImagePair(img1, img2, canvas, fixedWidth){
    var PADDING = 10;
    var ratioX = img1.height/img1.width + img2.height/img2.width;
    var ratioY = img1.width/img1.height + img2.width/img2.height;
    var alignX = (ratioX>1 ? ratioX : 1/ratioX) <= (ratioY>1 ? ratioY : 1/ratioY);
    var ratio1 = alignX ? fixedWidth/img1.width : (fixedWidth/ratioY)/img1.height,
        ratio2 = alignX ? fixedWidth/img2.width : (fixedWidth/ratioY)/img2.height;

    canvas.width = fixedWidth;
    canvas.height = alignX ? ratioX*fixedWidth : fixedWidth/ratioY;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img1, 0, 0, img1.width*ratio1, img1.height*ratio1);
    if (alignX) {
        ctx.drawImage(img2, 0, img1.height*ratio1+PADDING, img2.width*ratio1, img2.height*ratio1);
    }
    else {
        ctx.drawImage(img2, img1.width*ratio1+PADDING, 0, img2.width*ratio1, img2.height*ratio1);
    }

    var offsetX, offsetY;
    if (alignX) {
        offsetX = 0;
        offsetY = img1.height * ratio1 + PADDING;
    }
    else {
        offsetX = img1.width * ratio1 + PADDING;
        offsetY = 0;
    }

    return {
        alignX: alignX,
        ratio1: ratio1,
        ratio2: ratio2,
        padding: PADDING,
        offsetX: offsetX,
        offsetY: offsetY,
        cam1: { width: img1.width, height: img1.height },
        cam2: { width: img2.width, height: img2.height }
    };

}