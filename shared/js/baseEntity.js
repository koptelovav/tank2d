define(['./model'], function (Model) {
    var BaseEntity = Model.extend({
        init: function (id, type, kind) {
            this.id = parseInt(id);
            this.kind = kind;
            this.type = type;

            this.strength = 0;
            this.life = 1;
            this.destroy = [Types.Destroy.FULL, Types.Destroy.VIEW, Types.Destroy.COLLIDING];

            this.collections = [Types.Collections.ENTITY];
            this.externalImpact = [];
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

        getChunk: function (predict) {
            var i,
                j,
                gridX = this.gridX,
                gridY = this.gridY,
                chunk = [];

            if (predict) {
                if (this.orientation === Types.Orientations.LEFT) gridX--;
                else if (this.orientation === Types.Orientations.UP) gridY--;
                else if (this.orientation === Types.Orientations.RIGHT) gridX++;
                else if (this.orientation === Types.Orientations.DOWN) gridY++;
            }

            for (i = 0; i < (this.height / 16 >> 0); i++)
                for (j = 0; j < (this.width / 16 >> 0); j++) {
                    chunk.push({"x": gridX + i, "y": gridY + j});
                }

            return chunk;
        },

        getViewBox: function () {
            return [
                {"x": this.x, "y": this.y},
                {"x": this.x, "y": this.y + this.width},
                {"x": this.x + this.height, "y": this.y},
                {"x": this.x + this.height, "y": this.y + this.width}
            ];
        },

        processImpact: function (impactArray) {
            _.each(impactArray, function (impact) {
                if (this.externalImpact.indexOf(impact.type) >= 0) {
                    switch (impact.type) {
                        case Types.Impact.DAMAGE:
                            if (this.strength !== 0 && this.strength < impact.power)
                                this.life = this.life - impact.power;
                            break;
                        case Types.Impact.FIRE:
                            break;
                        case Types.Impact.ICE:
                            break;
                        case Types.Impact.BANG:
                            break;
                    }
                }
            }, this);
        },

        onDestroy: function(){}
    });

    return BaseEntity;
});