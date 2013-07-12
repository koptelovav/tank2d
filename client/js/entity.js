define(['baseEntity', 'spritemanager'], function (BaseEntity, SpriteManager) {
    var Entity = BaseEntity.extend({
        init: function (id, type, kind) {
            this._super(id, type, kind);

            this.dirtyRect = [];
            this.sprite = null;
            this.animations = null;
            this.currentAnimation = null;
            this.speedAnimation = this.speedAnimation || 800;

            this.isLoaded = false;
            this.isDirty = false;

            this.setSprite(SpriteManager.getSprite(CONST.getKindString(this.kind)));
        },

        setSprite: function(sprite){
            if(this.sprite && this.sprite.name === sprite.name) {
                return this;
            }
            this.sprite = sprite;
            this.animations = sprite.createAnimations();
            this._setDirty();
            this.oldDirtyRect = this.dirtyRect;
            return this;
        },

        getAnimationByName: function(name) {
            var animation = null;

            if(name in this.animations) {
                animation = this.animations[name];
            }
            else {
                log.error("No animation called "+ name);
            }
            return animation;
        },

        setAnimation: function(name, speed, count, onEndCount) {
            if(this.sprite.isLoaded) {
                if(this.currentAnimation && this.currentAnimation.name === name) {
                    return;
                }

                var a = this.getAnimationByName(name);
                if(a) {
                    this.currentAnimation = a;
                    if(name.substr(0, 3) === "atk") {
                        this.currentAnimation.reset();
                    }
                    this.currentAnimation.setSpeed(speed);
                    this.currentAnimation.setCount(count ? count : 0, onEndCount || function() {
//                        self.idle();
                    });

                    this.currentAnimation.on('animation', function(){
                        this._setDirty();
                    }, this);
                }

                this.isLoaded = true;
            }
            else {
                console.log("Not ready for animation");
            }
        },

        _setDirty: function(){
            this.isDirty = true;
            this.dirtyRect = this._getBoundingRect();
        },

        _getBoundingRect: function(){
            var rect = {};

            rect.x = this.x;
            rect.y = this.y;
            rect.h = this.sprite.height;
            rect.w = this.sprite.width;

            return rect;
        }
    });

    return Entity;
});