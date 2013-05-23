
define(function() {

    var Connection = Class.extend({
        init: function(host, port) {
            this.id = 'client-connection';
            this.connection = null;
            this.host = host;
            this.port = port;
        },

        connect: function(){
            var self = this,
                url = "ws://"+ this.host +":"+ this.port +"/";
            this.connection = io.connect(url);

            this.connection.on('message', function (message) {
                self.receiveMessage(message);
            });

            this.connection.on('close', function () {
                self.emit('close');
            });

            this.emit('connect');
        },

        receiveMessage: function (message) {
            var data;

            data = JSON.parse(message);

            if (data instanceof Array) {
                if (data[0] instanceof Array) {
                    this.receiveActionBatch(data);
                } else {
                    this.receiveAction(data);
                }
            }
        },

        receiveAction: function (data) {
            data[0] = Types.getMessageName(data[0]);
            if (data[0] !== undefined) {
                console.log(data);
                this.emit.apply(this, data);
            }
        },

        receiveActionBatch: function (actions) {
            _.each(actions, function (action) {
                this.receiveAction(action);
            }, this);
        },

        send: function(){
            var args = JSON.stringify(_.toArray(arguments));
            this.connection.send(args);
        }
    });

    return Connection;
});