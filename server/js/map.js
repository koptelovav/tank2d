define(['model', 'utils', 'path', 'fs'],
    function (Model, Utils, path, fs) {

    var Map = Model.extend({
        init: function (game, filepath) {
            var self = this;

            this.game = game;
            this.isLoaded = false;

            fs.exists(filepath, function (exists) {
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
            this.tiles = [];
            this.bitmap = map.tiles;
            this.width = map.width;
            this.height = map.height;
            this.maxPlayers = map.maxplayers;
            this.minPlayers = map.minplayers;
            this.teamCount = map.teamcount;
            this.spawns = map.spawns;
            this.isLoaded = true;

            this.emit('init');
        },

        isOutOfBounds: function (x, y) {
            return x < 0 || x >= this.width || y < 0 || y >= this.height;
        },

        isTankColliding: function (x, y) {
            var self = this;
            if (this.isOutOfBounds(x, y)) {
                return true;
            }
            for (var id in this.game.collidingGrid[x][y]) {
                if (self.game.collidingGrid[x][y][id]['tankColliding']) return true;
            }
            return false;
        },

        isBulletColliding: function (x, y) {
            if (this.isOutOfBounds(x, y)) {
                return true;
            }

            for (var id in this.game.collidingGrid[x][y]) {
                if (this.game.collidingGrid[x][y][id]['bulletColliding']) return true;
            }
            return false;
        }
    });
    return Map;
});
