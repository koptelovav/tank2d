
var cls = require("./lib/class"),
    _ = require("underscore"),
    Entity = require("./entity"),
    Utils = require("./utils"),
    Types = require("../../client/shared/js/gametypes");

/**
 * Объект-хранилище классов статичных объектов карты
 */
var MapElements = {};

/**
 * Статичный класс-фабрика статичных объектов карты
 */
module.exports = MapElementFactory = {

    /**
     * Создает новый объет карты по типу
     *
     * @param {String} kind Тип объекта (Подробнее в Types.MapElements)
     */
    create: function(id, kind, x, y){
        return new MapElements[kind](id, kind, x, y);
    }
};

/**
 * Базовай класс для всех статичных объектов карты
 */
var MapElement = Entity.extend({
    /**
     * Конструктор класса. Инициализация объекта
     *
     * @this {MapElement}
     * @param {String} kind Тип объекта (подробнее в Types.MapElements)
     * @param x
     * @param y
     * @param {boolean} tankCollision Коллиция с танком
     * @param {boolean} bulletCollision Коллиция с пулей
     */
    init: function(id, kind, x, y, tankCollision, bulletCollision){
        this._super(id, 'tile',kind,x, y);
        this.kind = kind;
        this.tankColliding = tankCollision || false;
        this.bulletColliding = bulletCollision || false;
    },

    /**
     * Приватный метод. Возвращает параметры объекта.
     *
     * @this {MapElement}
     * @returns {Array} Массив параметров объекта
     * @private
     */
    _getBaseState: function() {
        return [
            this.kind,
            this.tankColliding,
            this.bulletColliding,
        ];
    },

    /**
     * Публичный метод. Возвращает параметры объекта.
     *
     * @this {MapElement}
     * @returns {Array} Массив параметров объекта
     */
    getState: function(){
        return this._getBaseState();
    },

    /**
     * Проверяет пустая ли клетка
     *
     * @this {MapElement}
     * @returns {boolean} Если пуста возвращает true, иначе, false
     */
    isEmpty: function(){
        return this.kind === Types.MapElements.EMPTY;
    },

    /**
     * Проверяет на возможность коллизии с пулей
     *
     * @this {MapElement}
     * @returns {boolean}
     */
    isBulletColliding: function(){
        return this.bulletColliding;
    },

    /**
     * Проверяет на возможность коллизии с танком
     *
     * @this {MapElement}
     * @returns {boolean}
     */
    isTankColliding: function(){
        return this.tankColliding;
    },

    getChunk: function(){
        return [[this.x, this.y]];
    }
});

/**
 * Класс описывающий стену
 */
MapElements.wall = MapElement.extend({
    /**
     * Конструктор класса. Инициализация объекта
     *
     * @param {String} kind Тип объекта (подробнее в Types.MapElements)
     * @param x
     * @param y
     */
    init: function(id, kind, x, y) {
        this._super(id, kind, x, y, true, true);
    }
});

/**
 * Класс описывающий бронированную
 */
MapElements.armoredwall = MapElement.extend({
    /**
     * Конструктор класса. Инициализация объекта
     *
     * @param {String} kind Тип объекта (подробнее в Types.MapElements)
     * @param x
     * @param y
     */
    init: function(id, kind, x, y) {
        this._super(id, kind, x, y, true, true);
    }
});

/**
 * Класс описывающий деревья
 */
MapElements.trees = MapElement.extend({
    /**
     * Конструктор класса. Инициализация объекта
     *
     * @param {String} kind Тип объекта (подробнее в Types.MapElements)
     * @param x
     * @param y
     */
    init: function(id, kind, x, y) {
        this._super(id, kind, x, y);
    }
});

/**
 * Класс описывающий воду
 */
MapElements.water = MapElement.extend({
    /**
     * Конструктор класса. Инициализация объекта
     *
     * @param {String} kind Тип объекта (подробнее в Types.MapElements)
     * @param x
     * @param y
     */
    init: function(id, kind, x, y) {
        this._super(id, kind, x, y, true);
    }
});

/**
 * Класс описывающий лед
 */
MapElements.ice = MapElement.extend({
    /**
     * Конструктор класса. Инициализация объекта
     *
     * @param {String} kind Тип объекта (подробнее в Types.MapElements)
     * @param x
     * @param y
     */
    init: function(id, kind, x, y) {
        this._super(id, kind, x, y);
    }
});
