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
                    if (eId != id && Types.getCollidingArray(this.game.entityGrid[x][y][id].kind).indexOf('tank') >= 0){
                        console.log(this.game.entityGrid[x][y][id]);
                        return true;
                    }
                }
                return false;
            },

            isBulletColliding: function (bullet) {
                var entity,
                    id,
                    gridX,
                    gridY,
                    colliding = {},
                    chunk = bullet.getViewChunk();

                _.each(chunk, function(pos){
                    gridX = pos[0] / 16 >> 0;
                    gridY = pos[1] / 16 >> 0;

                    for (id in this.game.entityGrid[gridX][gridY]) {
                        entity = this.game.entityGrid[gridX][gridY][id];

                        if (bullet.id !== entity.id &&
                            (pos[0]) >= entity.x && (pos[0]) <= (entity.x + entity.width) &&
                            (pos[1]) >= entity.y && (pos[1]) <= (entity.y + entity.height)) {
                            if (Types.getCollidingArray(entity.kind).indexOf(bullet.kind) >= 0) {
                                colliding[entity.id] = entity;
                            }
                        }
                    }
                }, this);

                return colliding;
            }
        });
        return Map;
    });
