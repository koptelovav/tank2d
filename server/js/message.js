
var cls = require("./lib/class"),
    _ = require("underscore"),
    Utils = require("./utils"),
    Types = require("../../shared/js/gametypes");

var Messages = {};
module.exports = Messages;

var Message = cls.Class.extend({
});


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

Messages.Move = Message.extend({
    init: function(entity) {
        this.entity = entity;
    },
    serialize: function() {
        return [Types.Messages.MOVE,
            this.entity.id,
            this.entity.x,
            this.entity.y];
    }
});

Messages.JoinGame = Message.extend({
    init: function(player) {
        this.player = player;
    },
    serialize: function() {
        return [Types.Messages.JOINGAME,
            this.player.id];
    }
});

Messages.LeftGame = Message.extend({
    init: function(player) {
        this.player = player;
    },
    serialize: function() {
        return [Types.Messages.LEFTGAME,
            this.player.id];
    }
});