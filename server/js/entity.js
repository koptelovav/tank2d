var cls = require("./lib/class"),
    _ = require("underscore"),
    Log = require('log');

// =======  ========

module.exports = Entity = cls.Class.extend({
    init: function(id, type, kind, x, y) {
        this.id = parseInt(id);
        this.type = type;
        this.kind = kind;
        this.x = x;
        this.y = y;
    },

    destroy: function() {

    },

    _getBaseState: function() {
        return [
            parseInt(this.id),
            this.kind,
            this.x,
            this.y
        ];
    },

    getState: function() {
        return this._getBaseState();
    },

    spawn: function() {
        return new Messages.Spawn(this);
    },

    despawn: function() {
        return new Messages.Despawn(this.id);
    },

    setPosition: function(x, y) {
        this.x = x;
        this.y = y;
    }
});