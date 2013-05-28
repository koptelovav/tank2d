define(['../../shared/js/entity'], function (Entity) {
    var Tile = Entity.extend({
        init: function (id, type, kind, x, y, tankCollision, bulletCollision) {
            this._super(id, type, kind);
            this.tankColliding = tankCollision;
            this.bulletColliding = bulletCollision;
            this.setPosition(x,y);
            this.setSize(16);
        },

        isBulletColliding: function () {
            return this.bulletColliding;
        },

        isTankColliding: function () {
            return this.tankColliding;
        },

        getChunk:function(){
            return [[this.gridX, this.gridY]];
        }
    });

    return Tile;
});
