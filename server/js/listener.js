define(['../../shared/js/model'],function(Model){
    var Listener  = Model.extend({
        init: function(game, player){
            this.game = game;
            this.player = player;
            this.connection = player.connection;

            this.connection.on('listen',function(message){
                var action = parseInt(message[0]);

                if (!player.hasEnteredGame && action !== Types.Messages.HELLO) { // HELLO must be the first message
                    player.connection.disconnect("Invalid handshake message: " + message);
                    return;
                }
                if (player.hasEnteredGame && !player.isDead && action === Types.Messages.HELLO) { // HELLO can be sent only once
                    player.connection.disconnect("Cannot initiate handshake twice: " + message);
                    return;
                }

                if (action === Types.Messages.HELLO) {
                    if (game.isFull()) {
                        // self.send([Types.Messages.GAMEFULL, self.id]);
                    } else {
                        player.hasEnteredGame = true;
                        player.isDead = false;

                        game.emit('playerEnter', player);
                    }
                }
                else if (action === Types.Messages.MOVE) {
                    var orientation = message[1];

                    player.setOrientation(orientation);

                    if (game.isValidPlayerMove(player, orientation)) {
                        player.move();
                        game.addToEntityGrid(player);
                    }

                    player.emit('move');
                }
                else if (action === Types.Messages.IREADY) {
                    player.isReady = true;
                    player.emit('ready');
                }
                else if (action === Types.Messages.LOADMAP) {
                    player.isLoad = true;
                    player.emit('load');
                }
                else if (action === Types.Messages.CHAT) {
                    player.emit('chatMessage', message[1]);
                }
            });

            this.connection.on('close', function () {
                player.emit('exit');
            });

            this.connection.send('go');
        }
    });

    return Listener;
});
