var Backbone = require("backbone"),
    path = require('path'),
    fs = require('fs'),
    Types = require('../../shared/js/gametypes'),
    Utils = require('./utils');

module.exports = Map = Backbone.Model.extend({
    defaults:{
        "isLoaded": false
    },
    initialize: function () {
        var self = this;

        fs.exists(this.get('filePath'), function (exists) {
            if (!exists) {
                log.error(self.get('filePath') + " doesn't exist.");
                return;
            }

            fs.readFile(self.get('filePath'), function (err, file) {
                var json = JSON.parse(file.toString());

                self.initMap(json);
            });
        });
    },

    initMap: function (map) {
        this.set('tiles',[]);
        this.set('bitmap',map.tiles);
        this.set('width',map.width);
        this.set('height',map.height);
        this.set('maxPlayers',map.maxplayers);
        this.set('minPlayers',map.minplayers);
        this.set('teamCount',map.teamcount);
        this.set('spawns',map.spawns);
        this.set('isLoaded',map.true);

        if (this.ready_func) {
            this.ready_func();
        }
    },

    ready: function (ready_func) {
        this.ready_func = ready_func;
    },

    isOutOfBounds: function (x, y) {
        return x < 0 || x >= this.width || y < 0 || y >= this.height;
    },

    isTankColliding: function (x, y) {
        var self = this;
        if (this.isOutOfBounds(x, y)) {
            return true;
        }
        for (var id in this.get('game').collidingGrid[x][y]) {
            if (self.game.collidingGrid[x][y][id]['tankColliding']) return true;
        }
        return false;
    },

    isBulletColliding: function (x, y) {
        if (this.isOutOfBounds(x, y)) {
            return true;
        }

        for (var id in this.get('game').collidingGrid[x][y]) {
            if (this.game.collidingGrid[x][y][id]['bulletColliding']) return true;
        }
        return false;
    }
});
