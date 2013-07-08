define(['../../shared/js/entity'], function (Entity) {
    var Tile = Entity.extend({
        init: function (id, type, kind, x, y) {

            this._super(id, type, kind);
            this.life = 1;
            this.setPosition(x,y);
            this.collections = this.collections.concat([Types.Collections.TILE]);
        }
    });

    return Tile;
});
