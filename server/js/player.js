var Tank = require("./tank"),
    Messages = require("./message"),
    Types = require("../../shared/js/gametypes");

module.exports = Player = Tank.extend({
    defaults: {
        "hasEnteredGame": false,
        "team": null,
        "isReady": false,
        "isLoad": false,
        "isMove": false,
        "isDead": false,
        "kind": Types.Entities.TANK
    },

    initialize: function(){
        var self = this;

        this.set('id',this.get('connection').id);

        this.get('connection').listen(function(message) {
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
                if(self.get('game').isFull()){
                    self.send([Types.Messages.GAMEFULL, self.id]);
                }else{
                    self.get('game').addPlayer(self);
                    self.get('game').enter_callback(self);

                    self.hasEnteredGame = true;
                    self.isDead = false;

                    self.send([Types.Messages.WELCOME, self.getState()]);
                }
            }
            else if(action === Types.Messages.MOVE) {
                var orientation = message[1];

                self.setOrientation(orientation);

                if(self.get('game').isValidPlayerMove(self, orientation)) {
                    self.onBeforeMove(function(){
                        self.get('game').removeFromCollidingGrid(self);
                    });
                    self.move();
                    self.get('game').addToCollidingGrid(self);
                }

                self.broadcast(new Messages.Move(self));
            }
            else if(action === Types.Messages.IREADY) {
                self.isReady = true;
                self.ready_callback(self);
                self.broadcast(new Messages.iReady(self));
            }
            else if(action === Types.Messages.LOADMAP){
                self.isLoad = true;
                self.load_callback(self);
            }
            else if(action === Types.Messages.CHAT){
                self.broadcast(new Messages.chat(self.id,message[1]),false);
            }
        });

        this.get('connection').onClose(function() {
            if(self.exit_callback) {
                self.exit_callback();
            }
        });

        this.get('connection').send('go');
    },

    /**
     * Функция вызывается при выходе игрока из игры
     * @param callback
     */
    onExit: function(callback){
        this.exit_callback = callback;
    },

    onReady: function(callback){
        this.ready_callback = callback;
    },


    /**
     * Рассылка мообщения всем игрокам
     * @param callback
     */
    onBroadcast: function(callback) {
        this.broadcast_callback = callback;
    },

    onSpawn: function(callback) {
        this.spawn_callback = callback;
    },

    onLoad: function(callback){
        this.load_callback = callback;
    },

    /**
     * Отправка сообщения текущему игроку
     * @param message
     */
    send: function(message){
        this.get('connection').send(message);
    },

    /**
     * Рассылка мообщения всем игрокам
     * @param message Сообщение для отправки
     * @param ignoreSelf ID игрока, который будет исключниз рассылки
     */
    broadcast: function(message, ignoreSelf) {
        if(this.broadcast_callback) {
            this.broadcast_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
        }
    },

    onBeforeMove: function(callback){
        this.beforemove_callback = callback;
    },

    setOrientation: function(newOrientation){
        this.orientation = newOrientation;
    },

    /**
     * Установить новую позицию в зависимости от текущего оринетации игрока
     */
    move: function(){
        if(this.beforemove_callback)
            this.beforemove_callback();

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
            this.get('id'),
            this.get('kind'),
            this.get('team'),
            this.get('isReady')
        ];

        return state;
    }
});