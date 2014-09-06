var _ = require('underscore');

/**
 * It needs navigate, beginNavigation, releaseNavigation
 */
module.exports = Ember.Mixin.create({

    windowMouseMove: null,

    windowMouseUp: null,

    getMouseMoveHandler: function(){
        var handler = this.get('windowMouseMove');
        if (!_.isFunction(handler)) {
            handler = this.navigate.bind(this);
            this.set('windowMouseMove', handler);
        }
        return handler;
    },

    getMouseUpHandler: function(){
        var handler = this.get('windowMouseUp');
        if (!_.isFunction(handler)) {
            handler = function(){
                window.removeEventListener('mousemove', this.getMouseMoveHandler(), false);
                window.removeEventListener('mouseup', this.getMouseUpHandler(), false);
                this.releaseNavigation();
            }.bind(this);
            this.set('windowMouseUp', handler);
        }
        return handler;
    },

    mouseDown: function(e){
        e.preventDefault();
        this.beginNavigation(e);
        window.addEventListener('mousemove', this.getMouseMoveHandler(), false);
        window.addEventListener('mouseup', this.getMouseUpHandler(), false);
    },

    contextMenu: function(){ return false; }

});