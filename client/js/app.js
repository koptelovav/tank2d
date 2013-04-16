
define(['jquery'], function($) {

    var App = Class.extend({
        init: function() {
            this.ready = false;
        },
        
        setGame: function(game) {
            this.game = game;
            this.ready = true;
        },
    
        start: function() {
            this.game.run(function() {

            });
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