define(['../../shared/js/model'], function (Model) {
    var Listener = Model.extend({
        init: function () {
            this.connections = {};
        },

        addConnection: function (connection) {
            var self = this;
            this.connections[connection.id] = connection;

            connection.on('message', function (message) {
                self.receiveMessage(message, connection);
            });

            connection.once('close', function () {
                self.emit('close', connection);
            });

            this.emit('connect', connection);
        },

        removeConnection: function (id) {
            delete this.connections[id];
        },

        receiveMessage: function (message, connection) {
            var data;

            data = JSON.parse(message);

            if (data instanceof Array) {
                if (data[0] instanceof Array) {
                    this.receiveActionBatch(data, connection);
                } else {
                    this.receiveAction(data, connection);
                }
            }
        },

        receiveAction: function (data, connection) {
            data[0] = Types.getMessageName(data[0]);
            if (data[0] !== undefined) {
                console.log(data);
                data.splice(1, 0, connection);

                this.emit.apply(this, data);
            }
        },

        receiveActionBatch: function (actions, connection) {
            _.each(actions, function (action) {
                this.receiveAction(action, connection);
            }, this);
        }
    });

    return Listener;
});
