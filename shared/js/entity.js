define(['../../shared/js/model'],function (Model) {
    var Entity = Model.extend({
        init: function (id, type, kind) {
            this.id = parseInt(id);
            this.kind = kind;
            this.type = type;
            this.sprite = null;
            this.animations = null;
            this.currentAnimation = null;

            //Modes
            this.isLoaded = false;
            this.visible = true;
            this.setDirty();
        },

        setPosition: function(x, y){
            this.x = x;
            this.y = y;
        },

        setSprite: function(sprite) {
            if(!sprite) {
                console.error(this.id + " : sprite is null", true);
                throw "Error";
            }

            if(this.sprite && this.sprite.name === sprite.name) {
                return;
            }

            this.sprite = sprite;

            this.animations = sprite.createAnimations();

            this.isLoaded = true;
            if(this.ready_func) {
                this.ready_func();
            }
        },

        getSprite: function() {
            return this.sprite;
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
            var self = this;

            if(this.isLoaded) {
                if(this.currentAnimation && this.currentAnimation.name === name) {
                    return;
                }

                var s = this.sprite,
                    a = this.getAnimationByName(name);

                if(a) {
                    this.currentAnimation = a;
                    if(name.substr(0, 3) === "atk") {
                        this.currentAnimation.reset();
                    }
                    this.currentAnimation.setSpeed(speed);
                    this.currentAnimation.setCount(count ? count : 0, onEndCount || function() {
                        self.idle();
                    });
                }
            }
            else {
                this.log_error("Not ready for animation");
            }
        },

        getChunk: function(){
            return [
                [this.x, this.y  ],[this.x+1, this.y  ],
                [this.x, this.y+1],[this.x+1, this.y+1]
            ];
        },

        setDirty: function() {
            this.isDirty = true;
            if(this.dirty_callback) {
                this.dirty_callback(this);
            }
        },

        onDirty: function(dirty_callback) {
            this.dirty_callback = dirty_callback;
        }
    });

    return Entity;
});