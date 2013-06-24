define(['../../shared/js/model','renderer'], function(Model, Renderer){
    var Layer = Model.extend({
        init: function(id, canvas){
            this.id = id;
            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");
            this.entities = {};
        },

        setSize: function(width, height){
            this.canvas.width = width;
            this.canvas.height = height;
        },

        forEachAnimatedEntities: function(callback){
            _.each(this.entities, function(entity){
                if(entity.isAnimated) {
                    callback(entity);
                }
            });
        },

        forEachDirtyEntities: function(callback){
            _.each(this.entities, function(entity){
                if(entity.isDirty) {
                    callback(entity);
                }
            });
        }
    });

    var SceneElement = Model.extend({
        init: function(entity){
            this.entity = entity;
            this.dirtyRect = [];
            this.sprite = null;
            this.animations = null;
            this.currentAnimation = null;

            this.isLoaded = false;
            this.isDirty = false;
            this.isAnimated = false;

            entity.on('redraw', function(){
                this._setDirty();
            }, this);

            entity.on('beginMove', function(){
                this.isAnimated = true;
            }, this);

            entity.on('endMove', function(){
                this.isAnimated = false;
            }, this);

            entity.on('changeOrientation',function(){
                if (entity.orientation === Types.Orientations.LEFT)  this.setAnimation('move_left', 50);
                else if (entity.orientation === Types.Orientations.UP)  this.setAnimation('move_up', 50);
                else if (entity.orientation === Types.Orientations.RIGHT)  this.setAnimation('move_right', 50);
                else if (entity.orientation === Types.Orientations.DOWN)  this.setAnimation('move_down', 50);
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

        getId: function(){
            return this.entity.id;
        },

        getX: function(){
            return this.entity.x;
        },

        getY: function(){
            return this.entity.y
        },

        _setDirty: function(){
            this.isDirty = true;
            this.dirtyRect = this._getBoundingRect();
        },

        _getBoundingRect: function(){
            var rect = {};

            rect.x = this.entity.x;
            rect.y = this.entity.y;
            rect.h = this.sprite.height;
            rect.w = this.sprite.width;

            return rect;
        }
    });

    var Scene = Model.extend({
        init: function(width, height){
            this.width = width;
            this.height = height;
            this.layers = {};
            this.renderer = new Renderer(this);
        },

        refreshFrame: function(){
            this.renderer.renderFrame();
        },

        newLayer: function(id,canvas){
            if(!this._layerExist(id)){
                var layer = new Layer(id,canvas);
                layer.setSize(this.width,this.height);
                this._addLayer(layer);
            }
        },

        createElement: function(entity){
            return new SceneElement(entity);
        },

        addToLayer: function(sceneElement,layerName){
            this.layers[layerName]['entities'][sceneElement.getId()] = sceneElement;
        },

        removeFromLayer: function(entity,layerName){
            this.renderer.clearDirtyRect(this.layers[layerName], this.layers[layerName]['entities'][entity.id].oldDirtyRect);
            delete this.layers[layerName]['entities'][entity.id];
        },

        _addLayer: function(layer){
            this.layers[layer.id] = layer;
        },

        _layerExist: function(id){
            return id in this.layers;
        }
    });

    return Scene;
});