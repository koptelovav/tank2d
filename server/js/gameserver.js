
var cls = require("./lib/class"),
    _ = require("underscore"),
    Message = require('./message'),
    Types = require("../../shared/js/gametypes");

// ======= GAME SERVER ========

module.exports = GameServer = cls.Class.extend({
    init: function(id, name,maxPlayers, websocketServer) {
        var self = this;

        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.server = websocketServer;
        this.ups = 50;

        this.map = null;

        this.players = {};
        this.outgoingQueues = {};

        this.playerCount = 0;

        this.onPlayerConnect(function(player) {
        });

        this.onPlayerEnter(function(player) {
            log.info("Player has joined "+ self.id);

            self.incrementPlayerCount();

            self.pushBroadcast(new Message.Population(self.id, self.playerCount), player.id);
            self.pushBroadcast(new Message.JoinGame(player), player.id);

            player.onExit(function() {
                self.pushBroadcast(new Message.LeftGame(player), player.id);
                self.removePlayer(player);
                self.decrementPlayerCount();
            });

            player.onBroadcast(function(message, ignoreSelf) {
                self.pushBroadcast(message, ignoreSelf ? player.id : null);
            });
        });

        setInterval(function() {
            self.processQueues();
        }, 1000 / this.ups);

        console.info('game '+ this.id +' init');
    },

    run: function(mapFilePath) {
        console.info('game '+ this.id +' run');
    },

    processQueues: function() {
        var self = this,
            connection;

        for(var id in this.outgoingQueues) {
            if(this.outgoingQueues[id].length > 0) {
                console.log(this.outgoingQueues[id]);
                connection = this.server.getConnection(id);
                connection.send(this.outgoingQueues[id]);
                this.outgoingQueues[id] = [];
            }
        }
    },

    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    },

    onPlayerEnter: function(callback) {
        this.enter_callback = callback;
    },

    setPlayerCount: function(count) {
        this.playerCount = count;
    },

    incrementPlayerCount: function() {
        this.setPlayerCount(this.playerCount + 1);
    },

    decrementPlayerCount: function() {
        if(this.playerCount > 0) {
            this.setPlayerCount(this.playerCount - 1);
        }
    },

    pushToPlayer: function(player, message) {
        if(player && player.id in this.outgoingQueues) {
            this.outgoingQueues[player.id].push(message.serialize());
        } else {
            log.error("pushToPlayer: player was undefined");
        }
    },

    pushBroadcast: function(message, ignoredPlayer) {
        for(var id in this.outgoingQueues) {
            if(id != ignoredPlayer) {
                this.outgoingQueues[id].push(message.serialize());
            }
        }
    },

    addPlayer: function(player) {
        this.players[player.id] = player;
        this.outgoingQueues[player.id] = [];

        //log.info("Added player : " + player.id);
    },

    removePlayer: function(player) {
        delete this.players[player.id];
        delete this.outgoingQueues[player.id];
    }
});
