define(['model', 'tilefactory'],
    function (Model, TileFactory) {

        var BaseGame = Model.extend({
            init: function () {
            },

            registerEntityPosition: function (entity) {
                if (entity) {
                    _.each(entity.getChunk(), function (tile) {
                        this.entityGrid[tile.x][tile.y][entity.id] = entity;
                    }, this);
                }
            },

            unRegisterEntityPosition: function (entity) {
                _.each(entity.getChunk(), function (tile) {
                    this.removeFromEntityGrid(entity, tile.x, tile.y);
                }, this);
            },

            removeFromEntityGrid: function (entity, x, y) {
                if (this.entityGrid[x][y][entity.id]) {
                    delete this.entityGrid[x][y][entity.id];
                }
            },

            addEntity: function (entity, registerPosition) {
                if (registerPosition === true)
                    this.registerEntityPosition(entity);

                this.addToCollection(entity);

                this.emit('addEntity', entity);
            },

            removeEntity: function (entity) {
                entity.emit('destroy');

                if (_.indexOf(entity.destroy, Types.Destroy.COLLIDING) !== -1) {
                    entity.colliding = [];
                }

                if (_.indexOf(entity.destroy, Types.Destroy.FULL) !== -1) {
                    this.unRegisterEntityPosition(entity);

                    if (entity.kind === Types.Entities.BASE) {
                        delete this.teams[entity.team].base;
                    }
                    else if (entity.kind === Types.Entities.PLAYER) {
                        delete this.teams.players[entity.id];
                    }
                    this.removeFromCollection(entity);
                }

                this.emit('removeEntity', entity);
            },

            addToCollection: function (entity) {
                _.each(entity.collections, function (collection) {
                    if (this.collections[collection] === undefined)
                        this.collections[collection] = {};

                    this.collections[collection][entity.id] = entity;
                }, this);
            },

            removeFromCollection: function (entity) {
                _.each(entity.collections, function (collection) {
                    delete this.collections[collection][entity.id];
                }, this);
            },

            incrementPopulation: function () {
                this.setPopulation(this.population + 1);
            },

            decrementPopulation: function () {
                this.setPopulation(this.population - 1);
            },

            setPopulation: function (newPopulation) {
                this.population = newPopulation;
                this.emit('changePopulation', this.population);
            },

            entityIdExists: function (id) {
                return id in this.collections[Types.Collections.ENTITY];
            },

            getEntityById: function (id) {
                if (id in this.collections[Types.Collections.ENTITY]) {
                    return this.collections[Types.Collections.ENTITY][id];
                }
                else {
                    log.error("Unknown entity id : " + id, true);
                }
            },

            initMap: function () {
                var tile,
                    count = 0;

                for (var j, i = 0; i < this.map.height; i++) {
                    for (j = 0; j < this.map.width; j++) {
                        if (Types.getKindAsString(this.map.tiles[i][j])) {
                            tile = TileFactory.create((Types.Prefixes.TAIL + '' + count), this.map.tiles[i][j], i, j);
                            this.addEntity(tile, true);
                            count++;
                        }
                    }
                }

                _.each(this.map.teams, function (team, index) {
                    this.teams[index] = {};
                    this.teams[index].players = {};
                    this.teams[index].spawns = team.spawns;

                    if (team.base !== undefined) {
                        this.addBase(index, team.base.x, team.base.y);
                    }
                }, this);
            },

            addBase: function (teamNumber, x, y) {
                var tile = TileFactory.create((Types.Prefixes.BASE + '' + teamNumber), Types.Entities.BASE, x, y);
                tile.setTeam(teamNumber);

                _.each(tile.getChunk(), function (tile) {
                    for (var id in this.entityGrid[tile.x][tile.y]) {
                        this.removeEntity(this.entityGrid[tile.x][tile.y][id]);
                    }
                }, this);

                this.addEntity(tile, true);
                this.teams[teamNumber]['base'] = tile;
            },

            initEntityGrid: function () {
                for (var i = 0; i < this.map.height; i++) {
                    this.entityGrid[i] = [];
                    for (var j = 0; j < this.map.width; j++) {
                        this.entityGrid[i][j] = {};
                    }
                }
            },
        });

        return BaseGame;
    });
