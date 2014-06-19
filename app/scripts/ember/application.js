'use strict';

jQuery.event.props.push( "dataTransfer" );

var App = window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

require('./controllers/*');
require('./models/*');
require('./sfmlogic/*');
require('./views/*');
require('./dbadapter');
require('./router');
require('./utils');