'use strict';

jQuery.event.props.push( "dataTransfer" );

window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

App.Data = {
    images: Ember.A()
};
