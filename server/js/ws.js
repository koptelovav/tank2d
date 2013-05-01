var Model = require('./model'),
    url = require('url'),
    http = require('http'),
    Utils = require('./utils'),
    Types = require('../../shared/js/gametypes'),
    fs = require('fs'),
    express = require('express'),
    exphbs  = require('express3-handlebars'),
    WS = {};

module.exports = WS;

/**
 * Абстрактный класс серввера
 */

var Server = Model.extend({
    init: function (port) {
        this.port = port;
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
var Connection = Model.extend({
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
        this.room = null;
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


    init: function (port) {
        var self = this;

        this._connections = {};
        this._counter = 0;


        this._super(port);

        var app = express();
        app.engine('hbs', exphbs());
        app.set('view engine', 'hbs');
        app.use('/',express.static('./client'));
        app.use('/shared',express.static('./shared'));
        app.set('views', './server/views');

        app.get('/', function (req, res, next) {
            res.render('game/index');
        });

        this._httpServer = http.createServer(app).listen(port);


        this.ws = require('socket.io').listen(this._httpServer);

        this.ws.sockets.on('connection', function (connection) {
            var WebSocketIO = new WS.WebSocketConnection(self._createId(), connection, self);
            self.emit('connect',WebSocketIO);
            self.addConnection(WebSocketIO);
        });
    },

    broadcast: function (message) {
        this.forEachConnection(function (connection) {
            connection.send(message);
        });
    },

    sendToRoom: function(room, message){
        this.ws.sockets.in(room).send(JSON.stringify(message));
    },

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
            self.emit('listen',JSON.parse(message));
        });

        this._connection.on('disconnect', function () {
            self.emit('close');
            delete self._server.removeConnection(self.id);
        });
    },

    join: function(room){
        this._connection.join(room);
    },

    send: function (message) {
        this._connection.send(
            JSON.stringify(message)
        );
    },

    broadcast: function (message) {
        this._connection.broadcast.to(this.room).send(
            JSON.stringify(message)
        );
    }
});
