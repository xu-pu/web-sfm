loadImage('images/T48F9A3.jpg', function(img) {
    var ctx = getCanvas(img);
    var imgData = ctx.getImageData(0, 0, img.width, img.height);
    var gray = new Grayscale('canvas', { canvas: imgData });
    showGrayscale(gray);

    var octaveSpace = getOctaveSpace(gray);
    var dog1 = getDOGs(octaveSpace[0]);
    var keypoints1 = getKeyPoints(dog1);
    console.log(keypoints1);
});