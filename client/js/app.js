define(['jquery', 'model'], function ($, Model) {

    var App = Model.extend({
        init: function () {
            this.game = false;
            this.ready = false;
            this.gridLoad = false;
            this.$readyButton = $('#ready-button');
            this.playerGrid = $('#connected-grid');
            this.gameFrame = $('#canvas');
            this.$chatInput = $('#chat-input textarea');
            this.$chatHistory = $('#chat-history');
        },

        setGame: function (game) {
            this.game = game;
            this.ready = true;
        },

        start: function () {
            this.game.run();
        },

        connectingGame: function () {
            var self = this;

            if (!this.ready) {
                var watchCanStart = setInterval(function () {
//                    console.debug("waiting...");
                    if (self.canConnectingGame()) {
                        setTimeout(function () {
                            //тут должен быть загрузчик
                        }, 1500);
                        clearInterval(watchCanStart);
                        self.start();
                    }
                }, 100);
            } else {
                this.start();
            }
        },

        sendChatMessage: function (message) {
            this.game.sendChatMessage(message);
        },

        addChatMessage: function (playerId, message) {
            this.$chatHistory.append("<div>" + playerId + ": " + message + "</div>");
            this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
        },

        addPlayer: function (player) {
            var self = this;

            if(!self.gridLoad){
                var watchLoadGrid = setInterval(function () {
                    if (self.gridLoad) {
                        self._addPlayer(player);
                        clearInterval(watchLoadGrid);
                    }
                }, 100);
            }else{
                self._addPlayer(player);
            }
        },

        _addPlayer: function(player){
            this.getTeamById(player.team).find('.place span:empty:first').html('<div class="player" id="' + player.id + '">' + player.id + '</div>');
            if (player.isReady) this.setReady(player.id);
        },

        setReady: function (playerId) {
            $('#' + playerId).addClass('ready');
        },

        canConnectingGame: function () {
            return this.game;
        },

        getTeamById: function (id) {
            return $('#team' + id);
        }
    });

    return App;
});