
var Model = require("./model"),
    Utils = require("./utils"),
    Types = require("../../shared/js/gametypes");

var Messages = {};
module.exports = Messages;

/**
 * Класс сообщений
 * @type Message
 */
var Message = Model.extend({
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
            this.player.getState()];
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

Messages.iReady = Message.extend({
    init: function(player) {
        this.player = player;
    },
    serialize: function() {
        return [Types.Messages.IREADY,
            this.player.id];
    }
});

Messages.gameStart = Message.extend({
    init: function(id) {
        this.id = id;
    },
    serialize: function() {
        return [Types.Messages.GAMESTART,
            this.id];
    }
});

Messages.gamePlay = Message.extend({
    init: function(id) {
        this.id = id;
    },
    serialize: function() {
        return [Types.Messages.GAMEPLAY,
            this.id];
    }
});

Messages.gameData = Message.extend({
    init: function(game) {
        this.game = game;
    },
    serialize: function() {
        return [Types.Messages.GAMEDATA,
            this.game.id,
            this.game.playerCount,
            this.game.teamCount,
            this.game.maxPlayers,
            this.game.minPlayers,
            this.game.getPlayersInfo()
        ];
    }
});

Messages.spawn = Message.extend({
    init: function(player) {
        this.player = player;
    },
    serialize: function() {
        return [Types.Messages.SPAWN,
            this.player.id,
            this.player.x,
            this.player.y,
            this.player.orientation
        ];
    }
});

Messages.chat = Message.extend({
    init: function(id, message) {
        this.id = id;
        this.message = message;
    },
    serialize: function() {
        return [Types.Messages.CHAT,
            this.id,
            this.message,
        ];
    }
});


Messages.welcome = Message.extend({
    init: function(player) {
        this.player = player;
    },
    serialize: function() {
        return [Types.Messages.WELCOME,
            this.player.getState()
        ]
    }
});

