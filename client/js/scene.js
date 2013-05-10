define(['../../shared/js/model','renderer','sprite'], function(Model, Renderer, Sprite){
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

        forEachEntities: function(callback){
            _.each(this.entities, function(entity){
                callback(entity);
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
            this.animation = null;

            this.isDirty = true;

            entity.on('move animate', function(){
                this._setDirty();
            }, this);
        },

        setSprite: function(sprite){
            if(this.sprite && this.sprite.name === sprite.name) {
                return this;
            }
            this.sprite = sprite;
            this._setDirty();

            return this;
        },

        setAnimation: function(){

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

        _addLayer: function(layer){
            this.layers[layer.id] = layer;
        },

        _layerExist: function(id){
            return id in this.layers;
        }
    });

    return Scene;
});