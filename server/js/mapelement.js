var Entity = require("./entity"),
    Utils = require("./utils"),
    Types = require("../../shared/js/gametypes");

var Tiles = {};

module.exports = TileFactory = {
    create: function (id, kind, x, y) {
        var element = Tiles[kind];
        return new element({id: id, kind: kind, x: x, y: y});
    }
};

var Tile = Entity.extend({
    defaults: {
        "tankCollision": false,
        "bulletCollision": false
    },

    isEmpty: function () {
    },

    isBulletColliding: function () {
        return this.bulletColliding;
    },
    isTankColliding: function () {
        return this.tankColliding;
    },

    getChunk: function () {
        return [
            [this.attributes.x, this.attributes.y]
        ];
    }
});

Tiles.wall = Tile.extend({
    defaults: {
        "tankCollision": true,
        "bulletCollision": true
    }
});

Tiles.armoredwall = Tile.extend({
    defaults: {
        "tankCollision": true,
        "bulletCollision": true
    }
});

Tiles.trees = Tile.extend({
});

Tiles.water = Tile.extend({
    defaults: {
        "bulletCollision": true
    }
});

Tiles.ice = Tile.extend({
});
