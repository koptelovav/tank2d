define(['../../shared/js/entity'], function (Entity) {
    var Tile = Entity.extend({
        init: function (id, type, kind, x, y) {
            this._super(id, type, kind);
            this.strength = Types.getKindConfig(kind,'strength');
            this.setPosition(x,y);
            this.setSize(Types.getKindConfig(kind,'width'),Types.getKindConfig(kind,'height'));
        }
    });

    return Tile;
});
