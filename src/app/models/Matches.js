'use strict';

var _ = require('underscore');

var shortcuts = require('../../utils/shortcuts.js');

module.exports = Ember.Object.extend({

    images: [],

    matches: [],

    connectedGroups: function(){

        var groups = [];

        this.get('matches')
            .forEach(function(match){

                if (!match.robust) { return; }

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

    }.property('matches.length'),

    table: function(){

        var connected = this.get('connectedGroups');
        var images = this.get('images');
        var size = images.length;

        var matches = this.get('matches');
        var table = shortcuts.array2d(size, size, false);

        connected.forEach(function(group){
            if (group.length >= 2) {
                shortcuts.iterPairs(group, function(from, to){
                    table[from][to] = table[to][from] = true;
                });
            }
        });

        images.forEach(function(img){
            var i = img.get('id');
            table[i][i] = { isDiag: true, image: img };
        });

        matches.forEach(function(entry){
            var from = entry.from;
            var to = entry.to;
            entry.hasRaw = true;
            table[from][to] = table[to][from] = entry;
        });

        return table;

    }.property('matches.length', 'connectedGroups', 'images.length'),

    getMatches: function(i1, i2){

        var from = parseInt(i1, 10);
        var to = parseInt(i2, 10);

        if (from > to) {
            return this.getMatches(i2, i1);
        }

        var images = this.get('images'),
            matches = this.get('matches'),
            img1 = images.findBy('id', from),
            img2 = images.findBy('id', to),
            data = _.find(matches, function(e){
                return e.from === from && e.to === to;
            });

        if (img1 && img2 && data && data.robust) {
            return {
                from: img1,
                to: img2,
                raw: data.raw,
                robust: data.robust,
                F: data.F
            };
        }

    }

});