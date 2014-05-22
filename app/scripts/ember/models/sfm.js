'use strict';

App.Sfm = Ember.Object.extend({

    threadPoolSize: 4,

    threads: [],

    stage: SFM.STAGE_BEFORE,

    state: SFM.STATE_STOPPED

});

App.Thread = Ember.Object.extend({

    task: null,

    data: null,

    description: function(){

    }.property('task','data')

});