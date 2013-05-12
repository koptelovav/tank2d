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

            game.on('start',function(){
                game.setup(entities, background, foreground);
                game.loadMap();
            });

            game.on('load',function(){
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

            game.on('playerWelcome',function(player){
                 app.$readyButton.bind('click',function(){
                     app.$readyButton.unbind('click');
                     app.game.sendReady();
                     app.setReady(player.id);
                 });
            });

            game.on('changePopulation',function(newPopulation){
                $('#population span').text(newPopulation);
            });

            game.on('playerJoin',function(playerConfig){
                app.addPlayer(playerConfig);
            });

            game.on('playerLeft',function(id){
                app.playerGrid.find('#'+id).remove();
            });

            game.on('playerReady',function(playerId){
                app.setReady(playerId);
            });

            game.on('play',function(){
               app.gameFrame.show();
            });

            game.on('chatMessage',function(palyerId,message){
                app.addChatMessage(palyerId,message);
            });

            $("body").keydown(function(e) {
               /* var code = (e.keyCode ? e.keyCode : e.which);
                if(code == 13 && app.$chatInput.val()) {
                    app.sendChatMessage(app.$chatInput.val());
                    app.$chatInput.val('');
                }*/
            });

            var keysDown = {};

            addEventListener("keydown", function (e) {
                keysDown[e.keyCode] = true;
            }, false);

            addEventListener("keyup", function (e) {
                delete keysDown[e.keyCode];
                app.game.playerStopMove();
            }, false);

            game.on('tick', function(){
                if (38 in keysDown || 87 in keysDown) { // Player holding up
                    app.game.playerMoveUp();
                }
                if (40 in keysDown || 83 in keysDown) { // Player holding down
                    app.game.playerMoveDown();
                }
                if (37 in keysDown || 65 in keysDown) { // Player holding left
                    app.game.playerMoveLeft();
                }
                if (39 in keysDown || 68 in keysDown) { // Player holding right
                    app.game.playerMoveRight();
                }
                if(13 in keysDown){
                    app.game.playerFire();
                }
            });
        });
    };

    initApp();
});
