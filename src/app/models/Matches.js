'use strict';

var _ = require('underscore');

var shortcuts = require('../../utils/shortcuts.js');

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

        return groups;

    }.property('robust.length'),

    table: function(){

        var connected = _.flatten(this.get('connectedGroups'));
        var images = this.get('images');
        var size = images.length;

        var raw = this.get('raw');
        var robust = this.get('robust');

        var table = shortcuts.array2d(size, size, false);

        shortcuts.iterPairs(connected, function(from, to){
            table[from][to] = table[to][from] = true;
        });

        images.forEach(function(img){
            var i = img.get('id');
            table[i][i] = { isDiag: true, image: img };
        });

        raw.forEach(function(entry){
            var from = entry.from;
            var to = entry.to;
            var matches = entry.matches;
            var node = {
                from: from,
                to: to,
                raw: matches
            };
            table[from][to] = table[to][from] = node;
        });

        robust.forEach(function(entry){
            var from = entry.from;
            var to = entry.to;
            var matches = entry.matches;
            var fmatrix = entry.F;
            table[from][to]['robust'] = table[to][from]['robust'] = matches;
            table[from][to]['F'] = table[to][from]['F'] = fmatrix;
        });

        return table;

    }.property('robust.length', 'raw.length', 'connectedGroups', 'images.length'),

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
    },

    getMatches: function(from, to){
        from = parseInt(from, 10);
        to = parseInt(to, 10);
        var images = this.get('images'),
            raw = this.get('raw'),
            robust = this.get('robust');
        var img1 = images.findBy('id', from);
        var img2 = images.findBy('id', to);
        var r = raw.find(function(entry){
            return entry.from === from && entry.to === to;
        });
        var b = robust.find(function(entry){
            return entry.from === from && entry.to === to;
        });
        if (img1 && img2 && r && b) {
            return { from: img1, to: img2, raw: r.matches, robust: b.matches, F: b.F };
        }
    }

});