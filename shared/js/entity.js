define(['../../shared/js/model'], function (Model) {
    var Entity = Model.extend({
        init: function (id, type, kind) {
            this.id = parseInt(id);
            this.kind = kind;
            this.type = type;
        },

        setSize: function (width, height) {
            this.width = width;
            this.height = height || this.width;
        },

        setPosition: function (x, y) {
            this.setGridPosition(x, y);
            this.x = x * 16;
            this.y = y * 16;
        },

        setGridPosition: function (x, y) {
            this.gridX = x;
            this.gridY = y;
        },

        getChunk: function () {
            return [
                [this.gridX, this.gridY  ],[this.gridX+1, this.gridY  ],
                [this.gridX, this.gridY+1],[this.gridX+1, this.gridY+1]
            ];
        },

        colliding: function (entity) {
            if (entity.id !== this.id &&
                entity.x >= this.x && entity.x <= this.x + this.width &&
                entity.y >= this.y && entity.x <= this.y + this.height){
                if (Types.getCollidingArray(entity.kind).indexOf(this.kind) >= 0){
                    return true;
                }
            }
            return false;
        }
    });

    return Entity;
});