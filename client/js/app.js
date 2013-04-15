
define(['jquery'], function($) {

    var App = Class.extend({
        init: function() {

        },
        
        setGame: function(game) {
            this.game = game;
            this.ready = true;
        },
    
        start: function(username) {
        }
    });

    return App;
});