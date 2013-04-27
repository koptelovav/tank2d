define(['jquery', 'app'], function ($, App) {
    var app, game;

    var initApp = function () {
        $(document).ready(function () {
            app = new App();

            console.info("App initialized.");

            app.tryConnectingGame(function(){

            });

            app.onJoinPlayer(function(id, spawnPlace, team){
                app.getTeamById(team).append('<div data-place="'+spawnPlace+'" id="'+id+'">'+id+'</div>');
            });

            initGame();
        });
    };

    var initGame = function () {
        require(['game'], function (Game) {

            var entities = document.getElementById("entities"),
                background = document.getElementById("background"),
                foreground = document.getElementById("foreground");

            game = new Game(app);
            app.setGame(game);

            game.onStart(function(){
                game.setup(entities, background, foreground);
                game.loadMap();
            });

            game.onRun(function(){

            });

            game.onLoad(function(){
                for(var i = 0; i < app.game.teamCount; i++){
                    app.playerGrid.append('<div id="team'+i+'"></div>');
                    for(var j=0; j<(app.game.maxPlayers / app.game.teamCount); j++){
                        app.getTeamById(i).append('<div class="place">'+(j+1)+'. <span></span></div>')
                    }
                }

                app.playerGrid.show();

                _.each(app.game.entities, function(player){
                    app.addPlayer(player);
                });
            });

            game.onPlayerWelcome(function(player){
                app.$readyButton.bind('click',function(){
                    app.$readyButton.unbind('click');
                    app.game.sendReady();
                    app.setReady(player.id);
                });

            });

            game.onChangePopulation(function(){
                $('#population span').text(app.game.population);
            });

            game.onPlayerJoin(function(playerConfig){
                app.addPlayer(playerConfig);
            });

            game.onPlayerLeft(function(id){
                console.log('player left');
                app.playerGrid.find('#'+id).remove();
            });

            game.onPlayerReady(function(playerId){
                app.setReady(playerId);
            });

            game.onGamePlay(function(){
               app.gameFrame.show();
            });

            game.onChatMessage(function(palyerId,message){
                app.addChatMessage(palyerId,message);
            });

            $("body").keydown(function(e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if(code == 38 || code == 87) { //up
                    app.game.playerMoveUp();
                }
                else if(code == 39 || code == 68) { //right
                    app.game.playerMoveRight();
                }
                else if(code == 40 || code == 83) { //down
                    app.game.playerMoveDown();
                }
                else if(code == 37 || code == 65) { //left
                    app.game.playerMoveLeft();
                }
                else if(code == 17) { //fire
                    //   send('fire');
                }
            });

            $("body").keydown(function(e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if(code == 13 && app.$chatInput.val()) {
                    app.sendChatMessage(app.$chatInput.val());
                    app.$chatInput.val('');
                }
            });
        });
    };

    initApp();
});
