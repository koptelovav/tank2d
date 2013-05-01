var Model = require("./model"),
    _ = require("underscore"),
    Log = require('log');

/**
 * Базовый класс для динамических объектов находящихся на карте
 */
module.exports = Entity = Model.extend({
    _getBaseState: function() {
        return [
            parseInt(this.id),
            this.kind,
            this.x,
            this.y
        ];
    },

    /**
     * Приватный метод. Возвращает информацию об объекте.
     *
     * @this {Entity}
     * @returns {Array} Массив параметров объекта
     */
    getState: function() {
        return this._getBaseState();
    },

    /**
     * Возвращает сообщение об инициализации объекта на карте
     *
     * @this {Entity}
     * @returns {Messages.Spawn} Сообщение об инициализации
     */
    spawn: function() {
        return new Messages.Spawn(this);
    },

    /**
     * Возвращает сообщение об уничтожения объекта на карте
     *
     * @this {Entity}
     * @returns {Messages.Despawn} Сообщение об уничтожении
     */
    despawn: function() {
        return new Messages.Despawn(this.id);
    },

    /**
     * Получть чанк объекта (4 тайла)
     * @returns {Array}
     */
    getChunk: function(){
        return [
            [this.x, this.y  ],[this.x+1, this.y  ],
            [this.x, this.y+1],[this.x+1, this.y+1]
        ];
    }
});