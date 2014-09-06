module.exports = siftDescriptor;

/**
 * @param {DoG} img
 * @param {number} row
 * @param {number} col
 * @param {number} direction
 * @return {Feature}
 */
function siftDescriptor(img, row, col, direction){
    console.log('describing feature points');
    var point = SFM.RCtoImg(row, col, this.width, this.height);
    var transform = SFM.M([
        [Math.cos(direction), -Math.sin(direction), point.get(0,0)],
        [Math.sin(direction), Math.cos(direction), point.get(1,0)],
        [0,0,1]]);
    var descriptor = new Float32Array(128); // 4*4*8
    _.range(-8, 8).forEach(function(x){
        _.range(-8, 8).forEach(function(y){
            var block = Math.floor((x+8)/4)+4*Math.floor((y+8)/4);
            var imgPoint = transform.dot(SFM.M([[x,y,1]]).transpose());
            var gra = img.img.getGradient(imgPoint.get(0,0), imgPoint.get(1,0));
            var bin = Math.floor((gra.dir+Math.PI)/(2*Math.PI/8));
            descriptor[block*8+bin] = gra.mag;
        })
    });
    console.log(descriptor);
    return {
        row: row,
        col: col,
        vector: descriptor
    };
}