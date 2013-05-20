define(['../../shared/js/model'],
    function (Model) {

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
            }
        });

        return GameBase;
    });
