define(['model'],
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
                this.teams = map.teams;
                this.isLoaded = true;

                this.emit('init');
            },

            getData: function () {
                return this.data;
            },

            isOutOfBounds: function (x, y) {
                return x < 0 || x >= this.width || y < 0 || y >= this.height;
            },

            isBulletColliding: function (bullet) {
                var entity,
                    id,
                    gridX,
                    gridY,
                    x,
                    y,
                    collides,
                    colliding = {},
                    chunk = bullet.getViewBox();

                _.each(chunk, function(tile){
                    x = tile.x;
                    y = tile.y;
                    gridX = x / 16 >> 0;
                    gridY = y / 16 >> 0;

                    if (!this.isOutOfBounds(gridX, gridY))
                        for (id in this.game.entityGrid[gridX][gridY]) {
                            entity = this.game.entityGrid[gridX][gridY][id];

                            collides = this.collides(x, y,
                                x + bullet.height, y + bullet.width,
                                entity.x, entity.y,
                                entity.x + entity.height, entity.y + entity.width);

                            if (bullet.id !== entity.id &&
                                bullet.player.id !== entity.id &&
                                collides &&
                                entity.colliding.indexOf(bullet.kind) >= 0)
                                    colliding[entity.id] = entity;
                        }
                }, this);

                return colliding;
            },

            collides: function(x, y, r, b, x2, y2, r2, b2) {
                return !(r <= x2 || x > r2 ||
                    b <= y2 || y > b2);
            }
        });
        return Map;
    });
