module.exports = Ember.Service.extend({

    queue: [],

    notify: function(msg){
        this.get('queue').pushObject(msg);
    },

    resume: function(){
        var queue = this.get('queue');
        notifications.forEach(function(noti){
            var delaytime = noti.delay * 1000;
            var name = noti.name;
            if (localStorage.getItem(name)) { return; }
            setTimeout(function(){
                queue.pushObject(noti.message);
                localStorage.setItem(name, 'notified');
            }, delaytime);
        });

    }.on('init')

    /*
    msgTest: function(){
        var queue = this.get('queue');
        setTimeout(function(){
            queue.pushObjects([
                {
                    content: 'this is a message'
                },
                {
                    content: 'this is a message'
                },
                {
                    task: {
                        progress: '50',
                        desc: 'ahah dfadf fadfadjfkla fdasfjkakdh fadf'
                    }
                }
            ]);
        }, 2000);
    }.on('init')
    */
});


var notifications = [
    {
        name: 'incomplete',
        delay: 5,
        message: {
            content: 'WebSFM is still under construction, please try the demos, create new project won\'t work. More information on the welcome page.'
        }
    },
    {
        name: 'ptx',
        delay: 20,
        message: {
            content: 'I am looking for job, if you like this project, contact me.'
        }
    }
];