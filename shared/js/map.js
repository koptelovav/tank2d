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

            getData: function () {
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


            isBulletColliding: function (bullet) {

                var x = bullet.x / 16 >> 0,
                    y = bullet.y / 16 >> 0,
                    entity,
                    id,
                    w,
                    h;

                var colliding = {};

                for (id in this.game.entityGrid[x][y]) {
                    entity = this.game.entityGrid[x][y][id];
                    if (bullet.id !== entity.id &&
                        bullet.x >= entity.x && bullet.x <= (entity.x + entity.width) &&
                        bullet.y >= entity.y && bullet.y <= (entity.y + entity.height)) {
                        if (Types.getCollidingArray(entity.kind).indexOf(bullet.kind) >= 0) {
                            colliding[entity.id] = entity;
                        }
                    }
                }

                if (bullet.orientation === Types.Orientations.LEFT) {
                    y++;
                    w = 16;
                    h = 0;
                }
                else if (bullet.orientation === Types.Orientations.UP) {
                    x++;
                    w = 0;
                    h = 16;
                }
                else if (bullet.orientation === Types.Orientations.RIGHT) {
                    y++;
                    w = 16;
                    h = 0;
                }
                else if (bullet.orientation === Types.Orientations.DOWN) {
                    x++;
                    w = 0;
                    h = 16;
                }


                for (id in this.game.entityGrid[x][y]) {
                    entity = this.game.entityGrid[x][y][id];
                    if (bullet.id !== entity.id &&
                        (bullet.x + h) >= entity.x && (bullet.x + h) <= (entity.x + entity.width) &&
                        (bullet.y + w) >= entity.y && (bullet.y + w) <= (entity.y + entity.height)) {
                        if (Types.getCollidingArray(entity.kind).indexOf(bullet.kind) >= 0) {
                            colliding[entity.id] = entity;
                        }
                    }
                }
                return colliding;
            }
        });
        return Map;
    });
