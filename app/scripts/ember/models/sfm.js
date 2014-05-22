'use strict';

App.Sfm = Ember.Object.extend({

    threadPoolSize: 4,

    threads: [],

    stage: SFM.STAGE_BEFORE,

    state: SFM.STATE_STOPPED,

    isRunning: function(){
        return this.get('state') === SFM.STATE_RUNNING;
    }.property('state')

});

App.Thread = Ember.Object.extend({

    task: null,

    data: null,

    description: function(){

    }.property('task','data')

});