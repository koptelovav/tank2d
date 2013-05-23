define(['../../shared/js/model'],
    function (Model) {

        var Map = Model.extend({
            init: function (game) {
                this.game = game;
                this.isLoaded = false;
            },

            setData: function (map) {
                this.data = map;
                this.tiles = map.tiles;
                this.width = map.width;
                this.height = map.height;
                this.maxPlayers = map.maxplayers;
                this.minPlayers = map.minplayers;
                this.teamCount = map.teamcount;
                this.spawns = map.spawns;
                this.isLoaded = true;

                this.emit('init');
            },

            getData: function(){
                return this.data;
            },

            isOutOfBounds: function (x, y) {
                return x < 0 || x >= this.width || y < 0 || y >= this.height;
            },

            isTankColliding: function (x, y, eId) {
                if (this.isOutOfBounds(x, y)) {
                    return true;
                }
                for (var id in this.game.entityGrid[x][y]) {
                    if (this.game.entityGrid[x][y][id]['tankColliding'] && id !== eId) return true;
                }
                return false;
            },

            isBulletColliding: function (x, y) {
                if (this.isOutOfBounds(x, y)) {
                    return true;
                }

                for (var id in this.game.entityGrid[x][y]) {
                    if (this.game.entityGrid[x][y][id]['bulletColliding']) return true;
                }
                return false;
            }
        });
        return Map;
    });
