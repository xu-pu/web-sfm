module.exports = Ember.View.extend({

    tagName: 'div',

    templateName: 'widgets/demo-thumbnail',

    classNameBindings: ['controller.isExpanded'],

    classNames: [
        'welcome-screen__demos__thumbnail'
    ]

});