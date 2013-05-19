define(['../../shared/js/model'], function (Model) {
    var Listener = Model.extend({
        init: function () {
            this.connections = {};
        },

        addConnection: function (connection) {
            var self = this;
            this.connections[connection.id] = connection;

            connection.on('message', function (message) {
                self.receiveMessage(message, connection.id);
            });

            connection.on('close', function () {
                self.emit('close', connection.id);
            });

            this.emit('connect');
        },

        removeConnection: function (id) {
            delete this.connections[id];
        },

        receiveMessage: function (message, id) {
            var data;

            data = JSON.parse(message);
            if (data instanceof Array) {
                if (data[0] instanceof Array) {
                    this.receiveActionBatch(data, id);
                } else {
                    this.receiveAction(data, id);
                }
            }
        },

        receiveAction: function (data, id) {
            data[0] = Types.getMessageName(data[0]);
            if (data[0] !== undefined) {
                data.splice(1, 0, id);
                console.log(data);
                this.emit.apply(this, data);
            }
        },

        receiveActionBatch: function (actions, id) {
            _.each(actions, function (action) {
                this.receiveAction(action, id);
            }, this);
        }
    });

    return Listener;
});
