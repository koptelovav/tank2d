var Entity = require("./entity"),
    Log = require('log'),
    Types = require("../../shared/js/gametypes");

/**
 * Класс описывающий танк
 * @type {Tank}
 */
module.exports = Tank = Entity.extend({
    defaults: {
        "tankCollision": true,
        "bulletCollision": true
    },

    init: function (id, type, config) {
        var self = this;
        this._super(id, type, Types.Entities.TANK, 0, 0);
        this.id = parseInt(id);
        this.orientation = 0;
        this._params = config;
        this.speed = self._params['speed'];
        this.armor = self._params['armor'];
        this.bullet = self._params['bullet'];

        this.tankColliding = true;
        this.bulletColliding = true;
    },

    getState: function() {
        var basestate = this._getBaseState(),
            state = [];

        state.push(this.orientation);

        return basestate.concat(state);
    }
});