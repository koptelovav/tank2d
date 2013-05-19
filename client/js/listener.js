define(['../../shared/js/model'], function(Model) {
    var Listener = Model.extend({
        init: function() {
            this.connections = {};
        },

        addConnection: function(connection){
            var self = this;
            this.connections[connection.id] = connection;
            connection.on('message', function(message){
                var data = JSON.parse(message);
                if(data == 'go'){
                    self.emit('connect')
                }
                self.receiveMessage(message);
            });
        },

        receiveMessage: function(message) {
            var data;

            data = JSON.parse(message);
            if(data instanceof Array) {
                if(data[0] instanceof Array) {
                    this.receiveActionBatch(data);
                } else {
                    this.receiveAction(data);
                }
            }
        },

        receiveAction: function(data) {
            data[0] = Types.getMessageName(data[0]);
            console.log(data);
            if(data[0] !== undefined){
                this.emit.apply(this,data);
            }
        },

        receiveActionBatch: function(actions) {
            _.each(actions, function(action) {
                this.receiveAction(action);
            }, this);
        }
    });

    return Listener;
});
