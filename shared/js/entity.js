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

        getChunk2: function () {
            return [
                [this.gridX, this.gridY  ],[this.gridX+1, this.gridY  ],
                [this.gridX, this.gridY+1],[this.gridX+1, this.gridY+1]
            ];
        },

        getChunk: function (predict) {
            var i,
                j,
                gridX = this.gridX,
                gridY = this.gridY,
                chunk = [];

            if(predict){
                if (this.orientation === Types.Orientations.LEFT) gridX--;
                else if (this.orientation === Types.Orientations.UP) gridY--;
                else if (this.orientation === Types.Orientations.RIGHT) gridX++;
                else if (this.orientation === Types.Orientations.DOWN) gridY++;
            }

            for(i=0; i<(this.height / 16 >> 0); i++)
                for(j=0; j<(this.width / 16 >> 0); j++){
                    chunk.push([gridX+i, gridY+j]);
                }

            return chunk;
        }
    });

    return Entity;
});