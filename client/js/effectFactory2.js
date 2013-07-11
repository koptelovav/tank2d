define(['entity'],function (Entity) {

    var Effect = Entity.extend({
        init: function (id, type, kind, x, y) {
            this._super(id, type, kind);
            this.life = 1;
            this.animated = true;
            this.setSize(72);
            this.x = x - this.width / 2;
            this.y = y - this.height / 2;
            this.speedAnimation = 50;
        }
    });

    var Effects = {};

    var EffectFactory = {
        create: function (id, kind, x, y) {
            return new Effects[kind](id, kind, x, y);
        }
    };

    Effects[Types.Entities.BANG] = Effect.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'effect', kind, x, y);
            this.layer = Types.Layers.ENTITIES;
        }
    });

    return EffectFactory;
});
