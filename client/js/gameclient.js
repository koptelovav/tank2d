define(['player'], function(Player) {
    var GameClient = Class.extend({
        init: function(host, port) {
            this.connection = null;
            this.host = host;
            this.port = port;

            this.handlers = [];
            this.handlers[Types.Messages.WELCOME] = this.receiveWelcome;

            this.enable();
        },

        enable: function() {
            this.isListening = true;
        },

        disable: function() {
            this.isListening = false;
        },

        connect: function() {
            var url = "http://"+ this.host +":"+ this.port +"/",
                self = this;

            console.info("Trying to connect to server : "+url);

            this.connection = io.connect(url);

            this.connection.on('message', function(message){
                var data = JSON.parse(message);
                if(data == 'go'){
                    if(self.connected_callback) {
                        self.connected_callback();
                    }
                }
            });
        },

        sendMessage: function(message) {
            this.connection.send(JSON.stringify(message));
        },

        onConnected: function(callback) {
            this.connected_callback = callback;
        },

        onDisconnected: function(callback) {
            this.disconnected_callback = callback;
        },

        sendHello: function(){
            this.sendMessage([Types.Messages.HELLO,1]);
        }
    });

    return GameClient;
});
