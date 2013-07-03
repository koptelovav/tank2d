define(['../../shared/js/model','../../shared/js/tilefactory'],
    function (Model, TileFactory) {

        var GameBase = Model.extend({
            init: function () {
            },

            unregisterEntityPosition: function(entity) {
                if(entity && entity.x && entity.y) {
                    _.each(entity.getChunk(), function(pos){
                        this.removeFromEntityGrid(entity, pos[0], pos[1]);
                    }, this);
                }
            },

            addToEntityGrid: function(entity) {
                if(entity) {
                    _.each(entity.getChunk(), function(pos){
                        this.entityGrid[pos[0]][pos[1]][entity.id] = entity;
                    }, this);
                }
            },

            removeFromEntityGrid: function (entity, x, y) {
                if (this.entityGrid[x][y][entity.id]) {
                    delete this.entityGrid[x][y][entity.id];
                }
            },

            addEntity: function (entity) {
                this.entities[entity.id] = entity;
            },

            addMovableEntity: function (entity) {
                this.addEntity(entity);
                this.movableEntities[entity.id] = entity;
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
                return id in this.entities;
            },

            getEntityById: function (id) {
                if (id in this.entities) {
                    return this.entities[id];
                }
                else {
                    log.error("Unknown entity id : " + id, true);
                }
            },

            initMap: function () {
                var kind,
                    tile,
                    count = 0;

                for (var j, i = 0; i < this.map.height; i++) {
                    for (j = 0; j < this.map.width; j++) {
                        if ((kind = Types.getKindAsString(this.map.tiles[i][j])) !== undefined) {
                            tile = TileFactory.create((Types.Prefixes.TAIL +''+count), kind, i, j);
                            this.addStaticEntity(tile);
                            count++;
                        }
                    }
                }

                _.each(this.map.teams, function(team, index){
                    tile = TileFactory.create((Types.Prefixes.BASE +''+ index), 'base', team.base.x, team.base.y);
                    tile.setTeam(team);

                    _.each(tile.getChunk(), function(pos){
                        for (var id in this.entityGrid[pos[0]][pos[1]]) {
                            this.removeEntity(this.entityGrid[pos[0]][pos[1]][id]);
                        }
                    }, this);

                    this.addStaticEntity(tile);
                }, this);
            },

            addStaticEntity: function(tile){
                throw "Not implemented";
            },

            removeEntity: function (entity) {
                _.each(entity.getChunk(), function(pos){
                    this.removeFromEntityGrid(entity, pos[0], pos[1]);
                }, this);
                delete this.entities[entity.id];
                delete this.movableEntities[entity.id];
            },

            addStaticEntity: function(entity){
                this.addToEntityGrid(entity);
                this.addEntity(entity);
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

        return GameBase;
    });
