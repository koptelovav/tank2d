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
         * Команда игрока
         * @type {null|number}
         */
        this.team = null;

        this.isReady = false;

        this.isLoad = false;

        this.isMove = false;

        /**
         * Сосоянии игрока (жив / мертв)
         * @type {boolean}
         */
        this.isDead = false;

        this._super(this.connection.id, "player", {
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
                if(self.server.isFull()){
                    self.send([Types.Messages.GAMEFULL, self.id]);
                }else{
                    self.server.addPlayer(self);
                    self.server.enter_callback(self);

                    self.hasEnteredGame = true;
                    self.isDead = false;

                    self.send([Types.Messages.WELCOME, self.getState()]);
                }
            }
            else if(action === Types.Messages.MOVE) {
                var orientation = message[1];

                if(self.server.isValidPlayerMove(self, orientation)) {
                    self.onMoveStart(function(){
                        self.server.clearProection(self);
                    });

                    self.onMoveEnd(function(){
                        self.server.drawProection(self);
                        self.broadcast(new Messages.Move(self));
                    });

                    self.setOrientation(orientation);
                    self.move();
                }
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

    onMoveEnd: function(callback){
        this.onmoveend_callback = callback;
    },

    onMoveStart: function(callback){
        this.onmovestart_callback = callback;
    },

    setOrientation: function(newOrientation){
        this.orientation = newOrientation;
    },

    /**
     * Установить новую позицию в зависимости от текущего оринетации игрока
     */
    move: function(){
        if(this.onmovestart_callback)
            this.onmovestart_callback();

        if(this.orientation === Types.Orientations.LEFT) this.x--;
        else if(this.orientation === Types.Orientations.UP) this.y--;
        else if(this.orientation === Types.Orientations.RIGHT) this.x++;
        else if(this.orientation === Types.Orientations.DOWN) this.y++;

        if(this.onmoveend_callback)
            this.onmoveend_callback();
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