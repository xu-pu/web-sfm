'use strict';

App.TwoViewGridView = Ember.View.extend({

    tagName: 'table',

    classNames: [
        'main-container__match-table'
    ],

    templateName: 'widgets/twoviewgrid',

    NodeView: Ember.View.extend({

        tagName: 'th',

        viewX: null,

        viewY: null,

        isFinished: false,

        isInProgress: false
    })

});