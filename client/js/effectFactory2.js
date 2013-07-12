define(['entity', 'scene'],function (Entity, Scene) {

    var Effect = Entity.extend({
        init: function (id, type, kind) {
            this.life = 1;
            this.animated = true;
            this.layer = Types.Layers.ENTITIES;
            this._super(id, type, kind);
        }
    });

    var Effects = [];
    var EffectsArr = [];
    EffectsArr['destroy'] = [];
    EffectsArr['destroy'][Types.Entities.BULLET] = Types.Entities.BANG;
    EffectsArr['destroy'][Types.Entities.BASE] = Types.Entities.BIGBANG;

    var EffectFactory = {
        count: 0,
        create: function (entity, action) {
            if(EffectsArr[action][entity.kind] !== undefined){
                var id = Types.Prefixes.EFFECT + ''+ this.count;
                this.count++;
                var effect = new Effects[EffectsArr[action][entity.kind]](id, EffectsArr[action][entity.kind], entity.x, entity.y);
                effect.setAnimation('idle', effect.speedAnimation, 1, function(){
                    Scene.remove(effect);
                });
                Scene.add(effect);
            }
            return false;
        }
    };

    Effects[Types.Entities.BANG] = Effect.extend({
        init: function (id, kind, x, y) {
            this.setSize(32);
            this.x = x - this.width / 2 + 4 ;
            this.y = y - this.height / 2 + 4;
            this.speedAnimation = 30;
            this._super(id, 'effect', kind, x, y);
        }
    });

    Effects[Types.Entities.BIGBANG] = Effect.extend({
        init: function (id, kind, x, y) {
            this.setSize(32);
            this.x = x - this.width / 2;
            this.y = y - this.height / 2;
            this.speedAnimation = 80;
            this._super(id, 'effect', kind, x, y);

        }
    });

    return EffectFactory;
});


