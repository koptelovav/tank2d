define(['movableentity'], function (MovableEntity) {

    var Tank = MovableEntity.extend({
        init: function (id, type, kind, config) {
            this._params = config;
            this.speed = this._params['speed'];
            this.strength = this._params['armor'];
            this.bullet = this._params['bullet'];
            this._super(id, type, kind, this.speed);

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