var _ = require('underscore'),
    ndarray = require('ndarray'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var DragZoomMixin = require('../mixins/DragZoom.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    visualMatches = require('../../visualization/matches.js'),
    randomUtils = require('../../utils/random.js'),
    RESOURCE = settings.RESOURCE;

module.exports = Ember.Component.extend(DragZoomMixin, {

    tagName: 'canvas',

    resource: null,

    data: null,

    preRender: function(){
        var _self = this,
            resource = this.get('resource'),
            from = this.get('data.from'),
            to = this.get('data.to');
        Promise.all([
            resource.promiseResource(RESOURCE.FULLIMAGES, from).then(utils.promiseBufferImage),
            resource.promiseResource(RESOURCE.FULLIMAGES, to).then(utils.promiseBufferImage),
            resource.promiseResource(RESOURCE.FEATURE_POINTS, from),
            resource.promiseResource(RESOURCE.FEATURE_POINTS, to)
        ]).then(function(results){
            var img1 = results[0],
                img2 = results[1],
                points1 = new Float32Array(results[2]),
                points2 = new Float32Array(results[3]);
            _self.set('img1', img1);
            _self.set('img2', img2);
            _self.set('points1', ndarray(points1, [points1.length/4, 4]));
            _self.set('points2', ndarray(points2, [points2.length/4, 4]));
            _self.drawContent();
        });
    }.on('didInsertElement').observes('data.from', 'data.to'),

    drawContent: function(){
        switch (this.get('mode')) {
            case 'epipolar':
                this.drawRobust();
                break;
            case 'robust':
                this.drawMatches(this.get('data.robust'));
                break;
            case 'raw':
                this.drawMatches(this.get('data.raw'));
                break;
            default :
                throw 'Invalid visual matches mode!';
        }
    },

    drawRobust: function(){
        var robust = this.get('data.robust'),
            F = Matrix.create(this.get('data.F')),
            img1 = this.get('img1'),
            img2 = this.get('img2'),
            points1 = this.get('points1'),
            points2 = this.get('points2'),
            canv = this.get('element'),
            ctx = canv.getContext('2d');

        var config = visualMatches.drawImagePair(img1, img2, canv, 1500);

        _.sample(robust, 50).forEach(function(match){
            var i1 = match[0], i2 = match[1];
            var pair = [
                { row: points1.get(i1, 0), col: points1.get(i1, 1) },
                { row: points2.get(i2, 0), col: points2.get(i2, 1) }
            ];
            visualMatches.drawDetailedMatches(ctx, config, F, pair, randomUtils.genRGBString(), img1, img2);
        });
    },

    drawMatches: function(matches){
        var img1 = this.get('img1'),
            img2 = this.get('img2'),
            points1 = this.get('points1'),
            points2 = this.get('points2'),
            canv = this.get('element'),
            ctx = canv.getContext('2d');

        var config = visualMatches.drawImagePair(img1, img2, canv, 1500);
        visualMatches.drawMatches(config, ctx, matches, points1, points2);
    },

    wheel: function(e){
        var canvas = this.get('element'),
            currentWidth = this.$().width(),
            currentHeight = this.$().height(),
            speed = 0.04,
            nextWidth = currentWidth * (e.deltaY < 0 ? 1+speed : 1-speed),
            nextHeight = currentHeight * (e.deltaY < 0 ? 1+speed : 1-speed);
        if (nextWidth >= canvas.width) {
            jQuery(canvas).css('width', canvas.width).css('height', canvas.height);
        }
        else if (nextWidth > 500) {
            jQuery(canvas).css('width', nextWidth).css('height', nextHeight);
        }
    }

});