
define(['jquery'], function($) {

    var App = Class.extend({
        init: function() {
            this.ready = false;
            this.$readyButton = $('#ready-button');
            this.playerGrid =  $('#connected-grid');
            this.gameFrame = $('#canvas');
            this.$chatInput = $('#chat-input input');
            this.$chatHistory = $('#chat-history');
        },
        
        setGame: function(game) {
            this.game = game;
            this.ready = true;
        },
    
        start: function() {
            this.game.run(function() {

            });
        },

        sendChatMessage: function(message){
            this.game.sendChatMessage(message);
        },

        addChatMessage: function(playerId, message){
            this.$chatHistory.append("<div>"+playerId+": "+message+"</div>");
            this.$chatHistory.scrollTop = this.$chatHistory.scrollHeight;
        },

        onJoinPlayer: function(callback){
            this.joinplayer_callback = callback;
        },

        addPlayer:function(player){
            this.getTeamById(player.team).find('.place span:empty:first').html('<div class="player" id="'+player.id+'">'+player.id+'</div>');
            if(player.isReady) this.setReady(player.id);
        },

        setReady: function(playerId){
            $('#'+playerId).addClass('ready');
        },

        canConnectingGame: function() {
            return this.game;
        },

        startGame: function(starting_callback) {
            var self = this;

            if(starting_callback) {
                starting_callback();
            }

            self.start();
        },

        getTeamById: function(id){
            return $('#team'+id);
        },

        tryConnectingGame: function(starting_callback) {
            var self = this;

            if(!this.ready) {
                var watchCanStart = setInterval(function() {
                    console.debug("waiting...");
                    if(self.canConnectingGame()) {
                        setTimeout(function() {
                            //тут должен быть загрузчик
                        }, 1500);
                        clearInterval(watchCanStart);
                        self.startGame(starting_callback);
                    }
                }, 100);
            } else {
                this.startGame(starting_callback);
            }
        }
    });

    return App;
});