define(['../../shared/js/tile'],function (Tile) {

    var Tiles = {};

    var TileFactory = {
        create: function (id, kind, x, y) {
            return new Tiles[kind](id, kind, x, y);
        }
    };

    Tiles.wall = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles.base = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles.armoredwall = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles.trees = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles.water = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles.ice = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    return TileFactory;
});
