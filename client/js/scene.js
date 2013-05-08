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

    var Scene = Model.extend({
        init: function(width, height){
            this.width = width;
            this.height = height;
            this.layers = {};
            this.renderer = new Renderer(this);

            //resurses
            this.sprites = {};
            this.spriteNames = ["armoredwall", "ice", "trees", "wall", "water", "tank"];
            this._loadSprites();
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

        addToLayer: function(entity,layerName){
            this._setSprite(entity);
            this._setDirty(entity);

            entity.on('move', function(entity){
                this._setDirty(entity);
            }, this);

            this.layers[layerName]['entities'][entity.id] = entity;
        },

        _setDirty: function(entity){
            entity.isDirty = true;
            entity.dirtyRect = this.renderer.getEntityBoundingRect(entity);
        },

        _addLayer: function(layer){
            this.layers[layer.id] = layer;
        },

        _layerExist: function(id){
            return id in this.layers;
        },

        _loadSprite: function (name) {
            this.sprites[name] = new Sprite(name, 3);
        },

        _loadSprites: function () {
            _.map(this.spriteNames, this._loadSprite, this);
        },

        _setSprite: function(entity) {
            var sprite = this.sprites[entity.kind];

            if(!sprite) {
                console.error(this.id + " : sprite is null", true);
                throw "Error";
            }

            if(this.sprite && this.sprite.name === sprite.name) {
                return;
            }

            entity.sprite = sprite;
            entity.animations = sprite.createAnimations();
            entity.isLoaded = true;
        }
    });

    return Scene;
});