define(['../../shared/js/baseEntity'], function (BaseEntity) {
    var Entity = BaseEntity.extend({
        init: function (id, type, kind) {
            this._super(id, type, kind);

            this.dirtyRect = [];
            this.sprite = null;
            this.animations = null;
            this.currentAnimation = null;

            this.isLoaded = false;
            this.isDirty = false;
            this.isAnimated = this.animated;

            this.on('redraw', function(){
                this._setDirty();
            }, this);

            this.on('beginMove', function(){
                this.isAnimated = true;
            }, this);

            this.on('endMove', function(){
                this.isAnimated = false;
            }, this);

            this.on('changeOrientation',function(){
                if (this.orientation === Types.Orientations.LEFT)  this.setAnimation('move_left', 50);
                else if (this.orientation === Types.Orientations.UP)  this.setAnimation('move_up', 50);
                else if (this.orientation === Types.Orientations.RIGHT)  this.setAnimation('move_right', 50);
                else if (this.orientation === Types.Orientations.DOWN)  this.setAnimation('move_down', 50);
            }, this);
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