define(['../../shared/js/model'], function (Model) {
    var Listener = Model.extend({
        init: function () {
            this.connections = {};
        },

        addConnection: function (connection) {
            this.connections[connection.id] = connection;
        },

        removeConnection: function (id) {
            delete this.connections[id];
        },

        assign: function(entity, connection){
            var self = this;

            connection.on('message', function (message) {
                self.receiveMessage(message, entity);
            });

            connection.once('close', function () {
                entity.emit('exit');
            });

            this.emit('connect', entity);
        },

        receiveMessage: function (message, entity) {
            var data = JSON.parse(message);

            data[0] = Types.getMessageName(data[0]);
            if (data[0] !== undefined) {
                entity.emit.apply(entity, data);
            }
        }
    });

    return Listener;
});
