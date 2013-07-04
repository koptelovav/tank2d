define(['../../shared/js/entity'], function (Entity) {
    var Tile = Entity.extend({
        init: function (id, type, kind, x, y) {
            var config = Types.getKindConfig(kind);

            this._super(id, type, kind);
            this.strength = config.strength;
            this.colliding = config.colliding;
            this.setPosition(x,y);
            this.setSize(this.width, this.height);

        }
    });

    return Tile;
});
