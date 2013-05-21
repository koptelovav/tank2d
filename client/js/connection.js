
define(function() {

    var Connection = Class.extend({
        init: function(host, port) {
            this.id = 'client-connection';
            this.connection = null;
            this.host = host;
            this.port = port;
        },

        connect: function(){
            var url = "ws://"+ this.host +":"+ this.port +"/";
            this.connection = io.connect(url);
        },



        send: function(){
            var args = JSON.stringify(_.toArray(arguments));
            this.connection.send(args);
        },

        instance: function(){
            return this.connection;
        }

    });

    return Connection;
});