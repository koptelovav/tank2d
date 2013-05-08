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
        },

        setPosition: function(x, y){
            this.setGridPosition(x, y);
            this.x = x * 16;
            this.y = y * 16;
        },

        setGridPosition: function(x, y){
            this.gridX = x;
            this.gridY = y;
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
                [this.gridX, this.gridY  ],[this.gridX+1, this.gridY  ],
                [this.gridX, this.gridY+1],[this.gridX+1, this.gridY+1]
            ];
        }
    });

    return Entity;
});