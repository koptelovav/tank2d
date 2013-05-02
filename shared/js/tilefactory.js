define(['../../shared/js/tile'],function (Tile) {

    var Tiles = {};

    var TileFactory = {
        create: function (id, kind, x, y) {
            return new Tiles[kind](id, kind, x, y);
        }
    };

    Tiles.empty = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, false, false, 'background');
        }
    });

    Tiles.wall = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, true, true, 'background');
        }
    });

    Tiles.armoredwall = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, true, true, 'background');
        }
    });

    Tiles.trees = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, false, false, 'foreground');
        }
    });

    Tiles.water = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, true, false, 'background');
        }
    });

    Tiles.ice = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, false, false, 'background');
        }
    });

    return TileFactory;
});
