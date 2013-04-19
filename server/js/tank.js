var cls = require("./lib/class"),
    _ = require("underscore"),
    Entity = require("./entity"),
    Log = require('log'),
    Types = require("../../shared/js/gametypes");

// =======  ========
/**
 * Класс описывающий танк
 * @type {Tank}
 */
module.exports = Tank = Entity.extend({
    /**
     * Функция конструктор. Инициализация объекта.
     * @param {Number} id Униклальный индификатор
     * @param {String} type Тип игрока (player / NPC)
     * @param {Number} x Начальныя координата X
     * @param {Number} y Начальная координата Y
     * @param {Number} orientation Ориентация в пространстве
     * @param {JSON} config Параметры танка
     */
    init: function (id, type, x, y, orientation, config) {
        var self = this;
        this._super(id, type, Types.Entities.TANK, x, y);
        this.id = parseInt(id);
        this._params = config;
        this.speed = self._params['speed'];
        this.armor = self._params['armor'];
        this.bullet = self._params['bullet'];
        this.orientation = orientation;

    },

    /**
     * Получить информацию о состоянии объекта
     * @returns {Array} массив с параметрами
     */
    getState: function() {
        var basestate = this._getBaseState(),
            state = [];

        state.push(this.orientation);

        return basestate.concat(state);
    }
});