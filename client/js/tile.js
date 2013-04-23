define(['entity'], function (Entity) {
    var Tile = Entity.extend({
        init: function (id, kind, x, y, layer,tankCollision, bulletCollision) {
            this._super(id,kind);
            this.setPosition(x,y);
            this.layer = layer;
            this.tankColliding = tankCollision || false;
            this.bulletColliding = bulletCollision || false;
        },
        isEmpty: function () {
            return this.kind === Types.Tiles.EMPTY;
        },

        isBulletColliding: function () {
            return this.bulletColliding;
        },

        isTankColliding: function () {
            return this.tankColliding;
        }
    });

    return Tile;
});
