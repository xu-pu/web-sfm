module.exports = Ember.Service.extend({

    queue: [],

    resume: function(){
        var queue = this.get('queue');
        setTimeout(function(){
            queue.pushObjects([
                {
                    content: 'this is a message'
                },
                {
                    content: 'this is a message'
                }
            ]);
        }, 2000);
    }.on('init')

});