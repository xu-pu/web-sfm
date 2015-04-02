'use strict';

module.exports = Ember.Object.extend({

    images: [],

    raw: [],

    robust: [],

    connectedGroups: function(){

        var groups = [];

        this.get('robust')
            .forEach(function(match){

                var foundFrom = groups.find(function(e){
                    return e.contains(match.from);
                });

                var foundTo = groups.find(function(e){
                    return e.contains(match.to);
                });

                if (foundFrom && foundTo) {
                    if (foundFrom !== foundTo) {
                        foundFrom.addObjects(foundTo);
                        groups.removeObject(foundTo);
                    }
                }
                else if (foundFrom || foundTo) {
                    var found = foundFrom || foundTo;
                    found.addObjects([match.from, match.to]);
                }
                else {
                    groups.push([match.from, match.to]);
                }

            });

        console.log(groups);

        return groups;

    }.property('robust.length'),

    isMatched: function(from, to){
        return this.get('model').some(function(match){
            return match.from === from && match.to === to;
        });
    },

    isRobust: function(from, to){
        return this.get('robust').some(function(entry){
            return (entry.from === from && entry.to === to) || (entry.from === to && entry.to === from);
        });
    },

    isConnected: function(from, to){
        return this.get('connectedGroups').some(function(group){
            return group.contains(from) && group.contains(to);
        });
    }

});