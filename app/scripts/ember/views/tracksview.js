App.TracksView = Ember.View.extend({

    tagName: 'div',

    vis: null,

    didInsertElement: function(){
        this.visInit();
    },

    visInit: function(){
        var GROUP_IMAGES = 'images',
            GROUP_TRACKS = 'tracks';
        var edges = [];
        var nodes = this.get('controller.images').map(function(img){
            return {
                id: img.get('_id'),
                group: GROUP_IMAGES
            };
        });

        var options = {
            width: $(document.body).width()+'px',
            height: $(document.body).height()+'px'
        };
        var trackGraph = new vis.Graph(this.get('element'), { nodes: nodes, edges: edges }, options);
        this.set('vis', trackGraph);
    }

});