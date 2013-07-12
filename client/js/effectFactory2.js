define(['entity', 'scene'],function (Entity, Scene) {

    var Effect = Entity.extend({
        init: function (id, kind, e) {
            this._super(id, 'effect', kind);
            var dSize = e.height > e.width ? e.width : e.height;
            this.x = e.x + dSize / 2 - this.height / 2;
            this.y = e.y + dSize / 2- this.width / 2;
            this.animated = true;
            this.layer = CONST.LAYERS.EFFECTS;
        }
    });

    var Effects = [];
    var EffectsArr = [];
    EffectsArr[CONST.ACTIONS.DESTROY] = [];
    EffectsArr[CONST.ACTIONS.DESTROY][CONST.ENTITIES.BULLET] = CONST.ENTITIES.BANG;
    EffectsArr[CONST.ACTIONS.DESTROY][CONST.ENTITIES.BASE] = CONST.ENTITIES.BIGBANG;

    var EffectFactory = {
        count: 0,
        create: function (entity, action) {
            if(EffectsArr[action][entity.kind] !== undefined){
                var id = CONST.PREFIXES.EFFECT + ''+ this.count;
                this.count++;
                var effect = new Effects[EffectsArr[action][entity.kind]](id, EffectsArr[action][entity.kind], entity);
                effect.setAnimation('idle', effect.speedAnimation, 1, function(){
                    Scene.remove(effect);
                });
                Scene.add(effect);
            }
            return false;
        }
    };

    Effects[CONST.ENTITIES.BANG] = Effect.extend({
        init: function (id, kind, e) {
            this._super(id, kind, e);
            this.speedAnimation = 30;

        }
    });

    Effects[CONST.ENTITIES.BIGBANG] = Effect.extend({
        init: function (id, kind, e) {
            this._super(id, kind, e);
            this.speedAnimation = 80;
        }
    });

    return EffectFactory;
});


