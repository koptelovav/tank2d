define(['movableentity'], function (MovableEntity) {

    var Tank = MovableEntity.extend({
        init: function (id, type, kind, config) {
            for(var parameter in config){
                this[parameter] = config[parameter];
            }
            this._super(id, type, kind);

            this.layer = CONST.LAYERS.ENTITIES;
            this.animated = false;
            this.strength = 1;
            this.life = 1;
            this.colliding =  [
                CONST.ENTITIES.TANK,
                CONST.ENTITIES.BULLET,
                CONST.ENTITIES.WALL,
                CONST.ENTITIES.ARMOREDWALL,
                CONST.ENTITIES.WATER
            ];
        }
    });

    return Tank;
});