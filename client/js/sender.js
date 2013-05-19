define(['../../shared/js/model'], function(Model) {
    var Sender = Model.extend({
        init: function() {
            this.connections = {};
        },

        addConnection: function(connection){
            this.connections[connection.id] = connection;
        },

        removeConnection: function(id){
            delete this.connections[id];
        },

        send: function(id, message) {
            this.connections[id].send(JSON.stringify([message]));
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
