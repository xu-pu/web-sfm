App.Project = Ember.Object.extend({

    threadPoolSize: 4,

    threads: [],

    name: null,

    type: SFM.PROJECT_TYPE_NORMAL,

    stage: SFM.STAGE_BEFORE,

    state: SFM.STATE_STOPPED,

    SIFT_SOURCE: SFM.DATA_SOURCE_TEST,

    BUNDLER_SOURCE: SFM.DATA_SOURCE_TEST,

    MVS_SOURCE: SFM.DATA_SOURCE_TEST,

    isRunning: function(){
        return this.get('state') === SFM.STATE_RUNNING;
    }.property('state')

});