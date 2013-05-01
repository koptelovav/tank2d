var Tank = require("./tank"),
    Messages = require("./message"),
    Types = require("../../shared/js/gametypes");

module.exports = Player = Tank.extend({
    init: function(connection, game) {
        var self = this;

        this.connection = connection;
        this.server = game;

        this.team = null;

        this.hasEnteredGame = false;
        this.isReady = false;
        this.isLoad = false;
        this.isMove = false;
        this.isDead = false;

        this._super(this.connection.id, "player", {
            "speed": 20,
            "armor": 1,
            "bullet": 1
        });

        this.connection.on('listen',function(message) {
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
                if(self.server.isFull()){
                   // self.send([Types.Messages.GAMEFULL, self.id]);
                }else{
                    self.server.addPlayer(self);

                    self.server.emit('playerEnter',self);

                    self.hasEnteredGame = true;
                    self.isDead = false;

                    self.send(new Messages.welcome(self));
                }
            }
            else if(action === Types.Messages.MOVE) {
                var orientation = message[1];

                self.setOrientation(orientation);

                if(self.server.isValidPlayerMove(self, orientation)) {
                    self.move();
                    self.server.addToCollidingGrid(self);
                }

                self.broadcast(new Messages.Move(self));
            }
            else if(action === Types.Messages.IREADY) {
                self.isReady = true;
                self.emit('ready');

                self.broadcast(new Messages.iReady(self));
            }
            else if(action === Types.Messages.LOADMAP){
                self.isLoad = true;
                self.emit('load');
            }
            else if(action === Types.Messages.CHAT){
                self.sendAll(new Messages.chat(self.id,message[1]));
            }
        });

        this.connection.on('close',function() {
            self.emit('exit');
        });

        /**
         * Отсылаем сообщение что можно начинать игру
         */
        this.connection.send('go');
    },

    send: function(message){
        this.connection.send(message.serialize());
    },

    sendAll: function(message){
        this.connection.sendAll(message.serialize());
    },

    broadcast: function(message) {
        this.connection.broadcast(message.serialize());
    },

    setOrientation: function(newOrientation){
        this.orientation = newOrientation;
    },

    /**
     * Установить новую позицию в зависимости от текущего оринетации игрока
     */
    move: function(){
        this.emit('beforeMove', this);

        if(this.orientation === Types.Orientations.LEFT) this.x--;
        else if(this.orientation === Types.Orientations.UP) this.y--;
        else if(this.orientation === Types.Orientations.RIGHT) this.x++;
        else if(this.orientation === Types.Orientations.DOWN) this.y++;
    },

    /**
     * Получить информацию о состоянии объекта
     * @returns {Array} массив с параметрами
     */
    getState: function() {
        var state = [
            this.id,
            this.kind,
            this.team,
            this.isReady
        ];
        return state;
    }
});