define(['tile', 'gametypes'],function (Tile) {

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
            this.colliding = [Types.Entities.TANK, Types.Entities.BULLET];
            this.externalImpact = [Types.Impact.DAMAGE];
            this.setSize(16);
        }
    });

    Tiles[Types.Entities.BASE] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = Types.Layers.BACKGROUND;
            this.animated = false;
            this.strength = 1;
            this.colliding = [Types.Entities.TANK, Types.Entities.BULLET];
            this.externalImpact = [Types.Impact.DAMAGE];
            this.destroy = [Types.Destroy.COLLIDING];

            this.team = null;

            this.setSize(32);
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
            this.colliding = [Types.Entities.TANK, Types.Entities.BULLET];
            this.externalImpact = [Types.Impact.DAMAGE];

            this.setSize(16);
        }
    });

    Tiles[Types.Entities.TREES] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = Types.Layers.FOREGROUND;
            this.animated = false;
            this.strength = 0;
            this.colliding = [];

            this.setSize(16);
        }
    });

    Tiles[Types.Entities.WATER] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = Types.Layers.BACKGROUND;
            this.animated = false;
            this.strength = 0;
            this.colliding = [Types.Entities.TANK];

            this.setSize(16);
        }
    });

    Tiles[Types.Entities.ICE] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = Types.Layers.BACKGROUND;
            this.animated = false;
            this.strength = 0;
            this.colliding = [];

            this.setSize(16);
        }
    });

    return TileFactory;
});
