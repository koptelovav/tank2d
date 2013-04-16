var cls = require('./lib/class')
path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    MapElementFactory = require('./mapelement'),
    Types = require('../../shared/js/gametypes'),
    Utils = require('./utils');

module.exports = Map = cls.Class.extend({
    init: function (filepath) {
        var self = this;

        this.collidingGrid = [];
        this.isLoaded = false;

        path.exists(filepath, function (exists) {
            if (!exists) {
                log.error(filepath + " doesn't exist.");
                return;
            }

            fs.readFile(filepath, function (err, file) {
                var json = JSON.parse(file.toString());

                self.initMap(json);
            });
        });
    },

    initMap: function (map) {
        var self = this;
        this.tiles = map.tiles;
        this.width = map.tiles[0].length;
        this.height = map.tiles.length;
        this.maxPlayers = map.maxplayers;
        this.maxPlayers = map.minplayers;
        this.teamCount = map.teamcount;

        this.isLoaded = true;

        if (this.ready_func) {
            this.ready_func();
        }
    },

    ready: function (ready_func) {
        this.ready_func = ready_func;
    },

    generateCollisionGrids: function () {
        var self = this,
            kind;
// Заполняем карту объектами
        for (var j, i = 0; i < self.height; i++) {
            for (j = 0; j < self.width; j++) {
                if ((kind = Types.getKindAsString(self.tiles[i][j])) !== undefined) {
                    self.tiles[i][j] = MapElementFactory.create(kind);
                } else {
                    self.tiles[i][j] = undefined;
                    log.error(value + " element is not defined.");
                }
            }
        }

        if (this.isLoaded) {
            log.info("Collision grid generated.");
        }
    },

    isOutOfBounds: function (x, y) {
        return x <= 0 || x >= this.width || y <= 0 || y >= this.height;
    },

    isPlayerColliding: function (x, y) {
        if (this.isOutOfBounds(x, y)) {
            return true;
        }
        return this.tiles[x][y]['playerColliding'];
    },

    isBulletColliding: function (x, y) {
        if (this.isOutOfBounds(x, y)) {
            return true;
        }
        return this.tiles[x][y]['bulletColliding'];
    },

    clearProection: function (entity) {
        var self = this;

//        _.each(entity.getChunk(), function (pos) {
//            delete self.tiles[pos[0]][pos[1]]['owners'][entity.id];
//        });
    },

    drawProection: function (entity) {
        var self = this;

//        _.each(entity.getChunk(), function (pos) {
//            self.tiles[pos[0]][pos[1]]['owners'][entity.id] = entity.kind;
//        });
    }
});
