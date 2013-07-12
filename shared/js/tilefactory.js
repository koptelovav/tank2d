define(['tile', 'gametypes'],function (Tile) {

    var Tiles = {};

    var TileFactory = {
        create: function (id, kind, x, y) {
            return new Tiles[kind](id, kind, x, y);
        }
    };

    Tiles[CONST.ENTITIES.WALL] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = CONST.LAYERS.BACKGROUND;
            this.animated = false;
            this.strength = 30;
            this.colliding = [CONST.ENTITIES.TANK, CONST.ENTITIES.BULLET];
            this.externalImpact = [CONST.IMPACT.DAMAGE];
            this.setSize(16);
        }
    });

    Tiles[CONST.ENTITIES.BASE] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = CONST.LAYERS.BACKGROUND;
            this.animated = false;
            this.strength = 1;
            this.colliding = [CONST.ENTITIES.TANK, CONST.ENTITIES.BULLET];
            this.externalImpact = [CONST.IMPACT.DAMAGE];
            this.destroy = [CONST.DESTROY.COLLIDING];

            this.team = null;

            this.setSize(32);
        },

        setTeam: function(team){
            this.team = team;
        }
    });

    Tiles[CONST.ENTITIES.ARMOREDWALL] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = CONST.LAYERS.BACKGROUND;
            this.animated = false;
            this.strength = 60;
            this.colliding = [CONST.ENTITIES.TANK, CONST.ENTITIES.BULLET];
            this.externalImpact = [CONST.IMPACT.DAMAGE];

            this.setSize(16);
        }
    });

    Tiles[CONST.ENTITIES.TREES] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = CONST.LAYERS.FOREGROUND;
            this.animated = false;
            this.strength = 0;
            this.colliding = [];

            this.setSize(16);
        }
    });

    Tiles[CONST.ENTITIES.WATER] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = CONST.LAYERS.BACKGROUND;
            this.animated = true;
            this.strength = 0;
            this.colliding = [CONST.ENTITIES.TANK];

            this.setSize(16);
        }
    });

    Tiles[CONST.ENTITIES.ICE] = Tile.extend({
        init: function (id, kind, x, y) {
            this._super(id, 'tile', kind, x, y);
            this.layer = CONST.LAYERS.BACKGROUND;
            this.animated = false;
            this.strength = 0;
            this.colliding = [];

            this.setSize(16);
        }
    });

    return TileFactory;
});
