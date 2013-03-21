var cls = require("./lib/class"),
    _ = require("underscore"),
    Entity = require("./entity"),
    Log = require('log');

// =======  ========

module.exports = Tank = Entity.extend({
    init: function (id, type, kind, x, y, orientation, config) {
        var self = this;
        this._super(id, type, kind, x, y);
        this.id = parseInt(id);
        this._params = config;
        this.speed = self._params['speed'];
        this.armor = self._params['armor'];
        this.bullet = self._params['bullet'];
        this.orientation = orientation;

    },

    getState: function() {
        var basestate = this._getBaseState(),
            state = [];

        state.push(this.orientation);

        return basestate.concat(state);
    }
});