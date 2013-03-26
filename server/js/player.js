var cls = require("./lib/class"),
    Tank = require("./tank"),
    _ = require("underscore"),
    Messages = require("./message"),
    Types = require("../../shared/js/gametypes");

// ======= GAME SERVER ========

module.exports = Player = Tank.extend({
    init: function(connection, game) {
        var self = this;

        this.connection = connection;
        this.server = game;
        this.hasEnteredGame = false;
        this.isDead = false;
        this.orientation = undefined;

        this._super(this.connection.id, "player", 'TANK', 0, 0, 1, {
            "speed": 20,
            "armor": 1,
            "bullet": 1
        });

        this.connection.listen(function(message) {
           var action = parseInt(message[0]);

            if(!self.hasEnteredGame && action !== Types.Messages.HELLO) { // HELLO must be the first message
                self.connection.close("Invalid handshake message: "+message);
                return;
            }
            if(self.hasEnteredGame && !self.isDead && action === Types.Messages.HELLO) { // HELLO can be sent only once
               self.connection.close("Cannot initiate handshake twice: "+message);
                return;
            }

            if(action === Types.Messages.HELLO) {
                self.kind = Types.Entities.TANK;
                self.setPosition(0.5,0.5);

                self.server.addPlayer(self);
                self.server.enter_callback(self);

                self.send([Types.Messages.WELCOME, self.id]);
                self.hasEnteredGame = true;
                self.isDead = false;
            }
            else if(action === Types.Messages.MOVE) {
                var orientation = message[1];

                if(self.server.isValidPosition(x, y)) {
                    self.setPosition(x, y);
                    self.broadcast(new Messages.Move(self));
                }
            }

        });

        this.connection.onClose(function() {
            if(self.exit_callback) {
                self.exit_callback();
            }
        });

        this.connection.send('go');
    },

    onExit: function(callback){
        this.exit_callback = callback;
    },

    onBroadcast: function(callback) {
        this.broadcast_callback = callback;
    },

    send: function(message){
        this.connection.send(message);
    },

    broadcast: function(message, ignoreSelf) {
        if(this.broadcast_callback) {
            this.broadcast_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
        }
    }
});