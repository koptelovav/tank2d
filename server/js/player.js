var cls = require("./lib/class"),
    Tank = require("./tank"),
    BulletFactory = require("./bullet"),
    _ = require("underscore"),
    Messages = require("./message"),
    Types = require("../../shared/js/gametypes");

/**
 * Класс описывающий игрока
 * @type Player
 */
module.exports = Player = Tank.extend({
    /**
     * Класс констркутор. Инициализация объекта
     * @param {Connection} connection активнеое подключение игрока
     * @param {GameServer} game Игра к которой подключается игрок
     */
    init: function(connection, game) {
        var self = this;

        /**
         * Активнеое подключение игрока
         * @type {Connection}
         */
        this.connection = connection;

        /**
         * Игра к которой подключен игрок
         * @type {GameServer}
         */
        this.server = game;

        /**
         * Вошел ли рользователь в игру
         * @type {boolean}
         */
        this.hasEnteredGame = false;

        /**
         * Сосоянии игрока (жив / мертв)
         * @type {boolean}
         */
        this.isDead = false;

        this._super(this.connection.id, "player", Types.Entities.TANK, 1.5, 1.5, Types.Orientations.UP, {
            "speed": 20,
            "armor": 1,
            "bullet": 1
        });

        /**
         *  Функция для обработки сообщений от клиента
         *  @param {JSON} message Сообщение от клтента
         */
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
                self.server.addPlayer(self);
                self.server.drawProection(self);
                self.server.enter_callback(self);

                self.send([Types.Messages.WELCOME, self.id]);
                self.hasEnteredGame = true;
                self.isDead = false;
            }
            else if(action === Types.Messages.MOVE) {
                var orientation = message[1];

                if(self.server.isValidPlayerMove(self, orientation)) {
                    self.server.clearProection(self);
                    self.orientation = orientation;
                    self.setNewPosition();
                    self.server.drawProection(self);

//                    console.log(self.server.map.collidingGrid);

                    self.broadcast(new Messages.Move(self));
                }
            }

        });
        /**
         * Устонавливаем callback при отключении от игры
         */
        this.connection.onClose(function() {
            if(self.exit_callback) {
                self.exit_callback();
            }
        });

        /**
         * Отсылаем сообщение что можно начинать игру
         */
        this.connection.send('go');
    },

    /**
     * Функция вызывается при выходе игрока из игры
     * @param callback
     */
    onExit: function(callback){
        this.exit_callback = callback;
    },

    /**
     * Рассылка мообщения всем игрокам
     * @param callback
     */
    onBroadcast: function(callback) {
        this.broadcast_callback = callback;
    },

    /**
     * Отправка сообщения текущему игроку
     * @param message
     */
    send: function(message){
        this.connection.send(message);
    },

    /**
     * Рассылка мообщения всем игрокам
     * @param {Array} message Сообщение для отправки
     * @param {Number} ignoreSelf ID игрока, который будет исключниз рассылки
     */
    broadcast: function(message, ignoreSelf) {
        if(this.broadcast_callback) {
            this.broadcast_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
        }
    },

    /**
     * Установить новую позицию в зависимости от текущего оринетации игрока
     */
    setNewPosition: function(){
        if(this.orientation === Types.Orientations.LEFT) this.y--;
        else if(this.orientation === Types.Orientations.UP) this.x--;
        else if(this.orientation === Types.Orientations.RIGHT) this.y++;
        else if(this.orientation === Types.Orientations.DOWN) this.x++;
    }
});