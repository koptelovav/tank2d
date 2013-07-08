define(['../../shared/js/tile', '../../shared/js/gametypes'],function (Tile) {

    var Tiles = {};

    var TileFactory = {
        create: function (id, kind, x, y) {
            return new Tiles[kind](id, kind, x, y);
        }
    };

    Tiles[Types.Entities.WALL] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = Types.Layers.BACKGROUND;
            this.animated = false;
            this.strength = 30;
            this.width = 16;
            this.height = 16;
            this.colliding = [Types.Entities.TANK, Types.Entities.BULLET]
        }
    });

    Tiles[Types.Entities.BASE] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = Types.Layers.BACKGROUND;
            this.animated = false;
            this.strength = 0;
            this.width = 32;
            this.height = 32;
            this.colliding = [Types.Entities.TANK, Types.Entities.BULLET]
            this.team = null;
        },

        setTeam: function(team){
            this.team = team;
        }
    });

    Tiles[Types.Entities.ARMOREDWALL] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = Types.Layers.BACKGROUND;
            this.animated = false;
            this.strength = 60;
            this.width = 16;
            this.height = 16;
            this.colliding = [Types.Entities.TANK, Types.Entities.BULLET]
        }
    });

    Tiles[Types.Entities.TREES] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = Types.Layers.FOREGROUND;
            this.animated = false;
            this.strength = 0;
            this.width = 16;
            this.height = 16;
            this.colliding = []
        }
    });

    Tiles[Types.Entities.WATER] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = Types.Layers.BACKGROUND;
            this.animated = true;
            this.strength = 0;
            this.width = 16;
            this.height = 16;
            this.colliding = [Types.Entities.TANK]
        }
    });

    Tiles[Types.Entities.ICE] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = Types.Layers.BACKGROUND;
            this.animated = false;
            this.strength = 0;
            this.width = 16;
            this.height = 16;
            this.colliding = []
        }
    });

    return TileFactory;
});
