define(['./movableentity'], function (MovableEntity) {

    var Tank = MovableEntity.extend({
        init: function (id, type, kind, config) {
            this._params = config;
            this.speed = this._params['speed'];
            this.strength = this._params['armor'];
            this.bullet = this._params['bullet'];
            this._super(id, type, kind, this.speed);

            this.layer = Types.Layers.ENTITIES;
            this.animated = true;
            this.strength = 1;
            this.life = 1;
            this.colliding =  [
                Types.Entities.TANK,
                Types.Entities.BULLET,
                Types.Entities.WALL,
                Types.Entities.ARMOREDWALL,
                Types.Entities.WATER
            ];

            this.setSize(32);
        }
    });

    return Tank;
});