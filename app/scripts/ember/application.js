jQuery.event.props.push( "dataTransfer" );

var App = window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

require('./dbadapter');
require('./router');
require('./utils');

require('./controllers/*');
require('./models/*');
require('./sfmlogic/*');
require('./views/*');