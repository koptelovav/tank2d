/*
*  Используемые модули
* */
var cls = require("./lib/class"),
    _ = require("underscore"),
    Message = require('./message'),
    Map = require('./map'),
    Types = require("../../shared/js/gametypes");


/**
 * Класс игорового сервера
 *
 * @class MyClass
 * @constructor init
 */

module.exports = GameServer = cls.Class.extend({

    /**
     * Конструктор класса (инициализация игрового сервера)
     *
     * @this {GameServer}
     * @param {number} id ID игрового сервера
     * @param {string} name Название игорвого сервера (отображается пользователям)
     * @param {number} maxPlayers Максимальное количество игроков на карте
     * @param {WebsocketServer} websocketServer Сокет-сервер
     */
    init: function(id, name, maxPlayers, websocketServer) {
    /**
     * @TODO  name и maxPlayers заменить на передачу конфига с картой.
     */
        var self = this;

        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.server = websocketServer;
        this.ups = 50;

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

        console.info('game '+ this.id +' init');
    },

    /**
     * Запуск игрового сервера (выполняется после инициализации)
     *
     * @this {GameServer}
     * @param {string} mapFilePath ID игрового сервера
     */
    run: function(mapFilePath) {
        var self = this;

        this.map = new Map(mapFilePath);

        this.map.ready(function() {
            self.map.generateCollisionGrids();
        });

        setInterval(function() {
            self.processQueues();
        }, 1000 / this.ups);
    },

    /**
     * Обработка очереди.
     * Метод-рассыльщик сообщений пользователям
     *
     * @this {GameServer}
     */
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

    /**
     * Функция-колбэк.
     * Вызыватеся при подключении пользователя к игровому серверу
     *
     * @this {GameServer}
     * @param {function} callback
     */
    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    },

    /**
     * Функция-колбэк.
     * Вызывается после успешного подключения пользователя у игромому серверу
     *
     * @this {GameServer}
     * @param {function} callback
     */
    onPlayerEnter: function(callback) {
        this.enter_callback = callback;
    },

    /**
     * Устанавливает новое значенеие игровков на игровом сервере
     *
     * @this {GameServer}
     * @param {number} count новое количество игроков на игровом сервере
     */
    setPlayerCount: function(count) {
        this.playerCount = count;
    },

    /**
     * Увеличивает на 1 количество инроков на игровом сервере
     *
     * @this {GameServer}
     */
    incrementPlayerCount: function() {
        this.setPlayerCount(this.playerCount + 1);
    },

    /**
     * Уменьшает на 1 количество инроков на игровом сервере
     *
     * @this {GameServer}
     */
    decrementPlayerCount: function() {
        if(this.playerCount > 0) {
            this.setPlayerCount(this.playerCount - 1);
        }
    },

    /**
     * Отправить сообщение игроку
     *
     * @this {GameServer}
     * @param {Player} player Пользователь-получатель сообщения
     * @param {Message} message Сообщение для отправки
     */
    pushToPlayer: function(player, message) {
        if(player && player.id in this.outgoingQueues) {
            this.outgoingQueues[player.id].push(message.serialize());
        } else {
            log.error("pushToPlayer: player was undefined");
        }
    },


    /**
     * Отправить сообщение нескольким игрокам, подключенных к данному игровому серверу.
     * Возможно исключить одного пользователя, как правило отправителя сообщения.
     *
     * @this {GameServer}
     * @param {Message} message Сообщение для отправки
     * @param {number|undefined} ignoredPlayer ID исключаемого игрока
     */
    pushBroadcast: function(message, ignoredPlayer) {
        for(var id in this.outgoingQueues) {
            if(id != ignoredPlayer) {
                this.outgoingQueues[id].push(message.serialize());
            }
        }
    },

    /**
     * Добавить игрока в к игровому серверу.
     * Создает индекс в объекте очереди и сохранет игрока в массив игрков данного игрового сервера
     *
     * @this {GameServer}
     * @param {Player} player Новый игрок
     */
    addPlayer: function(player) {
        this.players[player.id] = player;
        this.outgoingQueues[player.id] = [];

        //log.info("Added player : " + player.id);
    },

    /**
     * Удалить игрока с игорового сервера.
     * Удаляет индекс в объекте очереди и игрока из массива игрков данного игрового сервера
     *
     * @this {GameServer}
     * @param {Player} player Игрок для удаления
     */

    removePlayer: function(player) {
        delete this.players[player.id];
        delete this.outgoingQueues[player.id];
    },

    isValidPosition: function(x, y) {
        if(this.map && _.isNumber(x) && _.isNumber(y) && !this.map.isPlayerColliding(x, y)) {
            return true;
        }
        return false;
    },

    isValidPlayerDirection: function(direction){
        if(this.map && Types.Orientations) {

        !this.map.isPlayerColliding(x, y)
            return true;
        }
        return false;
    }
});
