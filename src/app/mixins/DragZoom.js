module.exports = Ember.Mixin.create({

    makeDrag: function(){
        this.$().draggable();
    }.on('didInsertElement'),

    registerWheel: function(){
        var _self = this;
        jQuery(this.get('element')).on('wheel', function(e){
            _self.wheel(e.originalEvent);
        });
    }.on('didInsertElement')

});