define(['model', 'renderer'], function (Model, Renderer) {
    var Layer = Model.extend({
        init: function (id, canvas) {
            this.id = id;
            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");
            this.entities = {};
        },

        setSize: function (width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
        },

        forEachAnimatedEntities: function (callback) {
            _.each(this.entities, function (entity) {
                if (entity.animated) {
                    callback(entity);
                }
            });
        },

        forEachDirtyEntities: function (callback) {
            _.each(this.entities, function (entity) {
                if (entity.isDirty) {
                    callback(entity);
                }
            });
        }
    });

    var Scene = {
        layers: {},
        setSize: function (width, height) {
            this.width = width;
            this.height = height;
        },

        newLayer: function (id, canvas) {
            if (!(id in this.layers)) {
                var layer = new Layer(id, canvas);
                layer.setSize(this.width, this.height);
                this.layers[layer.id] = layer;
            }
        },

        add: function (entity) {
            this.layers[entity.layer]['entities'][entity.id] = entity;
        },

        remove: function (entity) {
            Renderer.clearDirtyRect(this.layers[entity.layer], this.layers[entity.layer]['entities'][entity.id].oldDirtyRect);
            delete this.layers[entity.layer]['entities'][entity.id];
        }
    };

    return Scene;
});