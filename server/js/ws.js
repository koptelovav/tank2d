var cls = require("./lib/class"),
    url = require('url'),
    http = require('http'),
    _ = require('underscore'),
    Utils = require('./utils'),
    Types = require('../../shared/js/gametypes'),
    WS = {};

module.exports = WS;

/**
 * Abstract Server and Connection classes
 */

var Server = cls.Class.extend({
    init: function (port) {
        this.port = port;
    },

    onConnect: function (callback) {
        this.connection_callback = callback;
    },

    onError: function (callback) {
        this.error_callback = callback;
    },

    broadcast: function (message) {
        throw "Not implemented";
    },

    forEachConnection: function (callback) {
        _.each(this._connections, callback);
    },

    addConnection: function (connection) {
        this._connections[connection.id] = connection;
    },

    removeConnection: function (id) {
        delete this._connections[id];
    },

    getConnection: function (id) {
        return this._connections[id];
    }
});


var Connection = cls.Class.extend({
    init: function (id, connection, server) {
        this._connection = connection;
        this._server = server;
        this.id = id;
    },

    onClose: function (callback) {
        this.close_callback = callback;
    },

    listen: function (callback) {
        this.listen_callback = callback;
    },

    broadcast: function (message) {
        throw "Not implemented";
    },

    send: function (message) {
        throw "Not implemented";
    },

    disconnect: function (logError) {
    }
});


/**
 * WebsocketServer
 */
WS.WebsocketServer = Server.extend({
    _connections: {},
    _counter: 0,

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


    broadcast: function (message) {
        this.forEachConnection(function (connection) {
            connection.send(message);
        });
    },

    _createId: function() {
        return Types.Prefixes.CONNECTION + '' + Utils.random(99) + '' + (this._counter++);
    }
});

WS.WebSocketConnection = Connection.extend({
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

    send: function (message) {
        this._connection.send(
            JSON.stringify(message)
        );
    }
});
