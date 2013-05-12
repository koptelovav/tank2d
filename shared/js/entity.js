define(['../../shared/js/model'],function (Model) {
    var Entity = Model.extend({
        init: function (id, type, kind) {
            this.id = parseInt(id);
            this.kind = kind;
            this.type = type;
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

        getChunk: function(){
            return [
                [this.gridX, this.gridY  ],[this.gridX+1, this.gridY  ],
                [this.gridX, this.gridY+1],[this.gridX+1, this.gridY+1]
            ];
        }
    });

    return Entity;
});