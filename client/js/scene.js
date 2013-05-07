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
            this.setDirty(entity);

            entity.on('move', function(entity){
                this.setDirty(entity);
            }, this);

            this.layers[layerName]['entities'][entity.id] = entity;
        },

        setDirty: function(entity){
            entity.isDirty = true;
            entity.dirtyRect = this.renderer.getEntityBoundingRect(entity);
        },

        removeEntity: function(entity){

        },

        _setEntityCallbacks: function(){

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