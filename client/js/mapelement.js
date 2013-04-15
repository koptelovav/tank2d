define(function () {
    var MapElements = {};


    var MapElementFactory = {
        create: function (kind) {
            return new MapElements[kind](kind);
        }
    };

    var MapElement = Class.extend({
        init: function (kind, tankCollision, bulletCollision) {
            this.kind = kind;
            this.tankColliding = tankCollision || false;
            this.bulletColliding = bulletCollision || false;
            this.owners = {};
        },
        isEmpty: function () {
            return this.kind === Types.MapElements.EMPTY;
        },

        isBulletColliding: function () {
            return this.bulletColliding;
        },

        isTankColliding: function () {
            return this.tankColliding;
        }
    });

    MapElements.empty = MapElement.extend({
        init: function (kind) {
            this._super(kind);
        }
    });

    MapElements.wall = MapElement.extend({
        init: function (kind) {
            this._super(kind, true, true);
        }
    });
    MapElements.armoredwall = MapElement.extend({
        init: function (kind) {
            this._super(kind, true, true);
        }
    });
    MapElements.trees = MapElement.extend({
        init: function (kind) {
            this._super(kind);
        }
    });
    MapElements.water = MapElement.extend({
        init: function (kind) {
            this._super(kind, true);
        }
    });

    MapElements.ice = MapElement.extend({
        init: function (kind) {
            this._super(kind);
        }
    });

    return MapElementFactory;
});
