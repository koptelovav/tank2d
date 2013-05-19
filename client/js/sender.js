define(['../../shared/js/model'], function(Model) {
    var Sender = Model.extend({
        init: function() {
            this.connections = {};
        },

        addConnection: function(connection){
            this.connections[connection.id] = connection;
        },

        send: function(id, message) {
            this.connections[id].send(JSON.stringify([message]));
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

    return Sender;
});
