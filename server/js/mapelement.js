
var cls = require("./lib/class"),
    _ = require("underscore"),
    Utils = require("./utils"),
    Types = require("../../shared/js/gametypes");

var MapElements = [];
module.exports = MapElementFactory = {
    create: function(type){
        return new MapElements[type](type);
    }
};

var MapElement = cls.Class.extend({
    init: function(kind, tankCollision, bulletCollision){
        this.kind = kind;
        this.playerColliding = tankCollision || false;
        this.bulletColliding = bulletCollision || false;
    },

    _getBaseState: function() {
        return [
            this.kind,
            this.playerColliding,
            this.bulletColliding
        ];
    },

    getState: function(){
        return this._getBaseState();
    },

    isEmpty: function(){
        return this.type === 0;
    },

    isBulletColliding: function(){
        return this.bulletColliding;
    },

    isTankColliding: function(){
        return this.tankColliding;
    }
});

MapElements[Types.MapElements.EMPTYTAIL] = MapElement.extend({
    init: function(kind) {
        this._super(kind);
    }
});

MapElements[Types.MapElements.WALL] = MapElement.extend({
    init: function(kind) {
        this._super(kind, true, true);
    }
});

MapElements[Types.MapElements.ARMORWALL] = MapElement.extend({
    init: function(kind) {
        this._super(kind, true, true);
    }
});

MapElements[Types.MapElements.TREES] = MapElement.extend({
    init: function(kind) {
        this._super(kind);
    }
});

MapElements[Types.MapElements.WATER] = MapElement.extend({
    init: function(kind) {
        this._super(kind, true);
    }
});

MapElements[Types.MapElements.ICE] = MapElement.extend({
    init: function(kind) {
        this._super(kind);
    }
});
