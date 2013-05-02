define(['tile','animatedtile'],function (Tile,AnimatedTile) {
    var TileFactory = {
        create: function (id, kind, x, y) {
            return new Tiles[kind](id,kind, x, y);
        }
    };

    var Tiles = {};

    Tiles.empty = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, 'background');
        }
    });

    Tiles.wall = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, 'background', true, true);
        }
    });

    Tiles.armoredwall = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, 'background', true, true);
        }
    });
    Tiles.trees = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, 'foreground');
        }
    });
    Tiles.water = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, 'background', true);
        }
    });

    Tiles.ice = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y, 'background');
        }
    });

    return TileFactory;
});
