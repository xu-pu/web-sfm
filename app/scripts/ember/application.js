jQuery.event.props.push( "dataTransfer" );

if (typeof Promise === 'undefined') {
    window.Promise = Ember.RSVP.Promise;
}

var App = window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

require('./dbadapter');
require('./StorageAdapter');
require('./router');
require('./utils');

require('./controllers/*');
require('./models/*');
require('./sfmlogic/*');
require('./views/*');