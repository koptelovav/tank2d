define(['player'], function(Player) {
    var GameClient = Class.extend({
        init: function(host, port) {
            this.connection = null;
            this.host = host;
            this.port = port;

            this.handlers = [];
            this.handlers[Types.Messages.WELCOME] = this.receiveWelcome;
            this.handlers[Types.Messages.GAMESTART] = this.receiveGameStarted;
            this.handlers[Types.Messages.GAMEDATA] = this.receiveLoadGameData;
            this.handlers[Types.Messages.JOINGAME] = this.receiveJoinGame;
            this.handlers[Types.Messages.POPULATION] = this.receivePopulation;
            this.handlers[Types.Messages.LEFTGAME] = this.receiveLeftGame;
            this.handlers[Types.Messages.IREADY] = this.receivePlayerReady;
            this.handlers[Types.Messages.GAMEFULL] = this.receiveGameFull;
            this.handlers[Types.Messages.GAMEPLAY] = this.receiveGamePlay;

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

                self.receiveMessage(message);
            });
        },

        receiveMessage: function(message) {
            var data;

            if(this.isListening) {
                data = JSON.parse(message);

                console.log("data: " + message);

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
            var action = data[0];
            if(this.handlers[action] && _.isFunction(this.handlers[action])) {
                this.handlers[action].call(this, data);
            }
            else {
                console.error("Unknown action : " + action);
            }
        },

        receiveActionBatch: function(actions) {
            var self = this;

            _.each(actions, function(action) {
                self.receiveAction(action);
            });
        },

        receivePlayerInfo: function(data, callback){
            var player = {
                id: data[0],
                kind: data[1],
                x: data[2],
                y: data[3],
                orientation: data[4],
                team: data[5],
                isReady: data[6]
            };

            if(callback) {
                callback(player);
            }
        },

        receiveWelcome: function(data){
            this.receivePlayerInfo(data[1],this.welcome_callback);
        },

        receiveLoadGameData: function(data){
            var self = this,
                id = data[1],
                population = data[2],
                teamCount = data[3],
                maxPlayers = data[4],
                minPlayers = data[5],
                players = data[6];

            var playersConfig = [];

            _.each(players, function(player){
                self.receivePlayerInfo(player,function(player){
                    playersConfig.push(player);
                });
            });

            if(this.loadgamedata_callback) {
                this.loadgamedata_callback(id, population, teamCount, minPlayers, maxPlayers, playersConfig);
            }
        },

        receiveGameStarted: function(){
            if(this.started_callback) {
                this.started_callback();
            }
        },

        receiveJoinGame: function(data){
            this.receivePlayerInfo(data[1],this.joingame_callback);
        },

        receiveLeftGame: function(data){
            var playerId = data[1];
            console.log('left player');

            if(this.leftgame_callback)
                this.leftgame_callback(playerId)
        },

        receivePopulation: function(){
            console.log('update population');
        },

        receivePlayerReady: function(data){
            var id = data[1];
            if(this.ready_callback){
                this.ready_callback(id);
            }
        },

        receiveGameFull: function(){
            console.log('game full');
        },

        receiveGamePlay: function(){
            if(this.gameplay_callback){
                this.gameplay_callback();
            }
        },

        sendMessage: function(message) {
            this.connection.send(JSON.stringify(message));
        },

        onConnected: function(callback) {
            this.connected_callback = callback;
        },

        onStarted: function(callback){
            this.started_callback= callback;
        },

        onWelcome: function(callback) {
            this.welcome_callback = callback;
        },

        onDisconnected: function(callback) {
            this.disconnected_callback = callback;
        },

        onLoadGameData: function(callback) {
            this.loadgamedata_callback = callback;
        },

        onJoinGame: function(callback){
            this.joingame_callback = callback;
        },

        onLeftGame: function(callback){
            this.leftgame_callback = callback;
        },

        onReady: function(callback){
            this.ready_callback = callback;
        },

        onGamePlay: function(callback){
            this.gameplay_callback = callback;
        },

        sendHello: function(){
            this.sendMessage([Types.Messages.HELLO]);
        },

        sendLoad: function(){
            this.sendMessage([Types.Messages.LOADMAP, this.id]);
        },

        sendReady: function(){
            this.sendMessage([Types.Messages.IREADY]);
        }
    });

    return GameClient;
});
