define(['../../shared/js/tile', '../../shared/js/gametypes'],function (Tile) {

    var Tiles = {};

    var TileFactory = {
        create: function (id, kind, x, y) {
          //  console.log([kind,Tiles[kind]]);
            return new Tiles[kind](id, kind, x, y);
        }
    };

    Tiles[Types.MapElements.WALL] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles[Types.MapElements.BASE] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.team = null;
        },

        setTeam: function(team){
            this.team = team;
        }
    });

    Tiles[Types.MapElements.ARMOREDWALL] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles[Types.MapElements.TREES] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles[Types.MapElements.WATER] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles[Types.MapElements.ICE] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    return TileFactory;
});
