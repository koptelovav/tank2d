define(['../../shared/js/tile', '../../shared/js/gametypes'],function (Tile) {

    var Tiles = {};

    var TileFactory = {
        create: function (id, kind, x, y) {
          //  console.log([kind,Tiles[kind]]);
            return new Tiles[kind](id, kind, x, y);
        }
    };

    Tiles[Types.Entities.WALL] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles[Types.Entities.BASE] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.team = null;
        },

        setTeam: function(team){
            this.team = team;
        }
    });

    Tiles[Types.Entities.ARMOREDWALL] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles[Types.Entities.TREES] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles[Types.Entities.WATER] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    Tiles[Types.Entities.ICE] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
        }
    });

    return TileFactory;
});
