define(['model','entity'],function (Model,Entity) {

    var Effect = Entity.extend({
        init: function (id, kind, e) {
            this._super(id, CONST.TYPES.EFFECT, kind);
            var dSize = e.height > e.width ? e.width : e.height;
            this.x = e.x + dSize / 2 - this.height / 2;
            this.y = e.y + dSize / 2- this.width / 2;
            this.animated = true;
            this.layer = CONST.LAYERS.EFFECTS;
        }
    });

    var Effects = [];
    var EffectConfig = [];
    EffectConfig[CONST.ACTIONS.DESTROY] = [];
    EffectConfig[CONST.ACTIONS.DESTROY][CONST.ENTITIES.BULLET] = CONST.ENTITIES.BANG;
    EffectConfig[CONST.ACTIONS.DESTROY][CONST.ENTITIES.BASE] = CONST.ENTITIES.BIGBANG;

    var EffectFactory = Model.extend({
        init: function (scene) {
            this.scene = scene;
            this.count = 0;
        },

        create: function (entity, action) {
            if(EffectConfig[action][entity.kind] !== undefined){
                var id = CONST.PREFIXES.EFFECT + ''+ this.count,
                    self = this;
                this.count++;
                var effect = new Effects[EffectConfig[action][entity.kind]](id, EffectConfig[action][entity.kind], entity);
                effect.setAnimation('idle', effect.speedAnimation, 1, function(){
                    self.scene.remove(effect);
                });
                this.scene.add(effect);
            }
            return false;
        }
    });

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


