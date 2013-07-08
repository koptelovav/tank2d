define(['../../shared/js/model','../../shared/js/tilefactory'],
    function (Model, TileFactory) {

        var GameBase = Model.extend({
            init: function () {
            },

            unregisterEntityPosition: function(entity) {
                _.each(entity.getChunk(), function(pos){
                    this.removeFromEntityGrid(entity, pos[0], pos[1]);
                }, this);
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
                if(entity.movable)
                    this.movableEntities[entity.id] = entity;

                this.entities[entity.id] = entity;
                this.addToCollection(entity);
            },

            addToCollection: function(entity){
                _.each(entity.collections, function(collection){
                    if(this.collections[collection] === undefined)
                        this.collections[collection] = {};

                    this.collections[collection][entity.id] = entity;
                }, this);
            },

            removeFromCollection: function(entity){
                _.each(entity.collections, function(collection){
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
                    this.teams[index] = {};
                    this.teams[index].players = {};
                    this.teams[index].spawns = team.spawns;

                    if(team.base !== undefined){
                        this.addBase(index, team.base.x, team.base.y);
                    }
                }, this);
            },

            addBase: function(teamNumber, x,y){
                var tile = TileFactory.create((Types.Prefixes.BASE +''+ teamNumber), 'base', x, y);
                tile.setTeam(teamNumber);

                _.each(tile.getChunk(), function(pos){
                    for (var id in this.entityGrid[pos[0]][pos[1]]) {
                        this.removeEntity(this.entityGrid[pos[0]][pos[1]][id]);
                    }
                }, this);

                this.addStaticEntity(tile);
                this.teams[teamNumber]['base'] = tile;
            },

            addStaticEntity: function(tile){
                throw "Not implemented";
            },

            removeEntity: function (entity) {
                if(entity.kind === 'base'){
                    delete this.teams[entity.team]['base'];
                }
                else if(entity.kind === 'player'){
                    delete this.players[entity.id];
                    delete this.teams.players[entity.id];
                }

                this.unregisterEntityPosition(entity);
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
