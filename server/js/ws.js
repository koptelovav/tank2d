var cls = require("./lib/class"),
    url = require('url'),
    http = require('http'),
    _ = require('underscore'),
    Utils = require('./utils'),
    Types = require('../../shared/js/gametypes'),
    WS = {};

module.exports = WS;

/**
 * Абстрактный класс серввера
 */

var Server = cls.Class.extend({
    init: function (port) {
        this.port = port;
    },
    /**
     * Функция вызывается при подключении клиента к серверу
     * @param callback функция-callback
     */
    onConnect: function (callback) {
        this.connection_callback = callback;
    },

    /**
     * Функция вызывается при ошибке
     * @param callback функция-callback
     */
    onError: function (callback) {
        this.error_callback = callback;
    },

    /**
     * Рассылка сообшения всем клиентам
     * @param {JSON} message cообщение для отправки
     */
    broadcast: function (message) {
        throw "Not implemented";
    },

    /**
     * Выполнить функцию для всех подключений
     * @param callback функция-callback
     */
    forEachConnection: function (callback) {
        _.each(this._connections, callback);
    },

    /**
     * Добавить подключение в колекцию
     * @param {Connection} connection индификатор подлючения
     */
    addConnection: function (connection) {
        this._connections[connection.id] = connection;
    },
    /**
     * Удалить значение по индификатору
     * @param {Number} id индификатор подлючения
     */
    removeConnection: function (id) {
        delete this._connections[id];
    },

    /**
     * Получить подключение по индификатору
     * @param {Number} id индификатор подлючения
     * @returns {Connection} объект класса Connection
     */
    getConnection: function (id) {
        return this._connections[id];
    }
});

/**
 * Абстрактынй класс подключения
 */
var Connection = cls.Class.extend({
    /**
     * Инициализация подключения
     * @param {Number} id индификатор подлючения
     * @param {Connection} connection объект класса Connection
     * @param {Server} server объект класса Server
     */
    init: function (id, connection, server) {
        this._connection = connection;
        this._server = server;
        this.id = id;
    },

    /**
     * Функция вызывается при закрытии соединения
     * @param callback функция-callback
     */
    onClose: function (callback) {
        this.close_callback = callback;
    },

    /**
     * Функция вызывается получении сообщения от клиента
     * @param callback функция-callback
     */
    listen: function (callback) {
        this.listen_callback = callback;
    },

    /**
     * Рассылка сообшения всем клиентам
     * @param {JSON} message cообщение для отправки
     */
    broadcast: function (message) {
        throw "Not implemented";
    },

    /**
     * Отправка соообщения клиенту
     * @param {JSON} message cообщение для отправки
     */
    send: function (message) {
        throw "Not implemented";
    },

    /**
     * Функция вызывается при отключнии от сервера
     * @param {String} logError названеи файла лога
     */
    disconnect: function (logError) {
    }
});


/**
 * WebSocket-сервер
 */
WS.WebsocketServer = Server.extend({
    /**
     * Коллекция активных подключений
     */
    _connections: {},

    /**
     * количество подключений к серверу
     */
    _counter: 0,

    /**
     * Инициализация срвера
     * @param {Number} port Порт по которому будет доступен сервер
     */
    init: function (port) {
        var self = this;

        this._super(port);

        this._httpServer = http.createServer(function (request, response) {
            response.writeHead(404);
            response.end();
        });

        this._httpServer.listen(port, function () {
            log.info("Server is listening on port " + port);
        });

        var io = require('socket.io').listen(this._httpServer);

        io.sockets.on('connection', function (connection) {
            var WebSocketIO = new WS.WebSocketConnection(self._createId(), connection, self);

            if(self.connection_callback){
                self.connection_callback(WebSocketIO);
            }

            self.addConnection(WebSocketIO);
        });
    },

    /**
     * Рассылка сообшения всем клиентам
     * @param {JSON} message cообщение для отправки
     */
    broadcast: function (message) {
        this.forEachConnection(function (connection) {
            connection.send(message);
        });
    },

    /**
     * Приватная функция. Генерирует уникальный ID подключения
     */
    _createId: function() {
        return Types.Prefixes.CONNECTION + '' + Utils.random(99) + '' + (this._counter++);
    }
});

WS.WebSocketConnection = Connection.extend({
    /**
     * Инициализация подключения
     * @param {Number} id индификатор подлючения
     * @param {Connection} connection объект класса Connection
     * @param {Server} server объект класса Server
     */
    init: function (id, connection, server) {
        var self = this;

        this._super(id, connection, server);

        this._connection.on('message', function (message) {
            if(self.listen_callback){
               self.listen_callback(
                   JSON.parse(message)
               );
            }
        });

        this._connection.on('disconnect', function () {
            log.info('disconnect');

            if(self.close_callback) {
                self.close_callback();
            }

            delete self._server.removeConnection(self.id);
        });
    },

    /**
     * Отправка соообщения клиенту
     * @param {JSON} message cообщение для отправки
     */
    send: function (message) {
        this._connection.send(
            JSON.stringify(message)
        );
    }
});
