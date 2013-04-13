
var cls = require("./lib/class"),
    _ = require("underscore"),
    Utils = require("./utils"),
    Types = require("../../shared/js/gametypes");

var Messages = {};
module.exports = Messages;

/**
 * Класс сообщений
 * @type Message
 */
var Message = cls.Class.extend({
});

/**
 * Класс сообщения. Изменение количества игроков.
 * @type Population
 */
Messages.Population = Message.extend({
    init: function(game, total) {
        this.game = game;
        this.total = total;
    },
    serialize: function() {
        return [Types.Messages.POPULATION,
            this.game,
            this.total];
    }
});

/**
 * Класс сообщения. Движение игрока.
 * @type Move
 */
Messages.Move = Message.extend({
    init: function(entity) {
        this.entity = entity;
    },
    serialize: function() {
        return [Types.Messages.MOVE,
            this.entity.id,
            this.entity.orientation];
    }
});

/**
 * Класс сообщения. Подключение игрока к игре.
 * @type JoinGame
 */
Messages.JoinGame = Message.extend({
    init: function(player) {
        this.player = player;
    },
    serialize: function() {
        return [Types.Messages.JOINGAME,
            this.player.id];
    }
});

/**
 * Класс сообщения. Выход игрока из игры.
 * @type LeftGame
 */
Messages.LeftGame = Message.extend({
    init: function(player) {
        this.player = player;
    },
    serialize: function() {
        return [Types.Messages.LEFTGAME,
            this.player.id];
    }
});