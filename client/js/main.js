
define(['jquery', 'app'], function($, App) {
    var app, game;

    var initApp = function() {
        $(document).ready(function() {
        	app = new App();

            console.info("App initialized.");
        
            initGame();
        });
    };
    
    var initGame = function() {
        require(['game'], function(Game) {
            
            var canvas = document.getElementById("entities"),
        	    background = document.getElementById("background");

    		game = new Game(app);
    		game.setup(canvas, background);
    		app.setGame(game);
    		
            game.loadMap();
            game.start();
            $(document).bind("keydown", function(e) {

            });
        });
    };
    
    initApp();
});
