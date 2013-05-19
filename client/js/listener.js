define(['../../shared/js/model'], function(Model) {
    var Listener = Model.extend({
        init: function(connection) {
            this.connection = connection;
            this.enable();
        },

        enable: function() {
            var self = this;
            this.isListening = true

            this.connection.on('message', function(message){
                var data = JSON.parse(message);
                if(data == 'go'){
                    self.emit('connect')
                }

                self.receiveMessage(message);
            });
        },

        disable: function() {
            this.isListening = false;
        },

        connect: function() {

        },

        receiveMessage: function(message) {
            var data;

            if(this.isListening) {
                data = JSON.parse(message);
                if(data instanceof Array) {
                    if(data[0] instanceof Array) {
                        this.receiveActionBatch(data);
                    } else {
                        this.receiveAction(data);
                    }
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
        },

        sendMessage: function(message) {
            this.connection.send(JSON.stringify(message));
        },

        sendHello: function(){
            this.sendMessage([Types.Messages.HELLO]);
        },

        sendLoad: function(){
            this.sendMessage([Types.Messages.LOADMAP, this.id]);
        },

        sendReady: function(){
            this.sendMessage([Types.Messages.IREADY]);
        },

        sendMove: function(orientation){
            this.sendMessage([Types.Messages.MOVE,orientation])
        },

        sendEndMove: function(){
            this.sendMessage([Types.Messages.ENDMOVE])
        },

        sendChatMessage: function(message){
            this.sendMessage([Types.Messages.CHAT,message])
        }
    });

    return Listener;
});
