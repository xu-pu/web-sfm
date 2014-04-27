"use strict";


loadImage('T48F9A3.jpg', function(img) {
    var ctx = getCanvas(img);
    var imgData = ctx.getImageData(0, 0, img.width, img.height);
    var gray = new Grayscale('canvas', { canvas: imgData });
    showGrayscale(gray);

    var gradientX = gray.convolution(SOBEL_KERNEL_X);
    showGrayscale(gradientX);

    var gradientY = gray.convolution(SOBEL_KERNEL_Y);
    showGrayscale(gradientY);

    var level1 = gray.convolution(GUASS_KERNEL_TEST);
    showGrayscale(level1);

    var level2 = level1.convolution(GUASS_KERNEL_TEST);
    showGrayscale(level2);

    var level3 = level2.convolution(GUASS_KERNEL_TEST);
    showGrayscale(level3);

    var level4 = level3.convolution(GUASS_KERNEL_TEST);
    showGrayscale(level4);

    var dog1 = level1.difference(level2);
    showGrayscale(dog1);

    var godogX = dog1.convolution(SOBEL_KERNEL_X);
    showGrayscale(godogX);

    var godogY = dog1.convolution(SOBEL_KERNEL_Y);
    showGrayscale(godogY);
});