define(['jquery', 'app'], function ($, App) {
    var app, game;

    var initApp = function () {
        $(document).ready(function () {
            app = new App();

            console.info("App initialized.");

            app.tryConnectingGame(function(){

            });

            initGame();
        });
    };

    var initGame = function () {
        require(['game'], function (Game) {

            var canvas = document.getElementById("entities"),
                background = document.getElementById("background");

            game = new Game(app);
            game.setup(canvas, background);
            app.setGame(game);

            game.loadMap();

            game.onRuning(function(){
                for(var i = 0; i < app.game.teamCount; i++){
                    $('#connected-grid').append('<div id="team'+(i+1)+'"></div>');
                }
                $('#connected-grid').show();
            });
        });
    };

    initApp();
});
