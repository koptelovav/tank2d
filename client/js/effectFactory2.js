define(['entity', 'scene'],function (Entity, Scene) {

    var Effect = Entity.extend({
        init: function (id, type, kind) {
            this.life = 1;
            this.animated = true;
            this.layer = CONST.LAYERS.EFFECTS;
            this._super(id, type, kind);
        }
    });

    var Effects = [];
    var EffectsArr = [];
    EffectsArr['destroy'] = [];
    EffectsArr['destroy'][CONST.ENTITIES.BULLET] = CONST.ENTITIES.BANG;
    EffectsArr['destroy'][CONST.ENTITIES.BASE] = CONST.ENTITIES.BIGBANG;

    var EffectFactory = {
        count: 0,
        create: function (entity, action) {
            if(EffectsArr[action][entity.kind] !== undefined){
                var id = CONST.PREFIXES.EFFECT + ''+ this.count;
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

    Effects[CONST.ENTITIES.BANG] = Effect.extend({
        init: function (id, kind, x, y) {
            this.setSize(32);
            this.x = x - this.width / 2 + 4 ;
            this.y = y - this.height / 2 + 4;
            this.speedAnimation = 30;
            this._super(id, 'effect', kind, x, y);
        }
    });

    Effects[CONST.ENTITIES.BIGBANG] = Effect.extend({
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


