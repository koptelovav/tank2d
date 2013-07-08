define(['jquery', 'app','input'], function ($, App) {
    var app, game;

    var initApp = function () {
        $(document).ready(function () {
            app = new App();

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
            game.setup(entities, background, foreground);
            app.setGame(game);


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

            game.on('playerWelcome',function(){
                 app.$readyButton.bind('click',function(){
                     app.$readyButton.unbind('click');
                     app.game.sendReady();
                    // app.setReady(player.id);
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

            var keyFire,
                keyMove;

            addEventListener("keydown", function (e) {
                keyFire = keyMove = e.keyCode;
            }, false);

            addEventListener("keyup", function (e) {
                if(32 === keyFire){
                    keyFire = false;
                }else{
                    keyMove = false;
                     app.game.playerStopMove()
                }

            }, false);

            game.on('tick', function(){
                if(input.isDown('DOWN') || input.isDown('s')) {
                    app.game.playerMoveDown();
                }
                else if(input.isDown('UP') || input.isDown('w')) {
                    app.game.playerMoveUp();
                }
                else if(input.isDown('LEFT') || input.isDown('a')) {
                    app.game.playerMoveLeft();
                }
                else if(input.isDown('RIGHT') || input.isDown('d')) {
                    app.game.playerMoveRight();
                }

                if(input.isDown('SPACE')) {
                    app.game.playerFire();
                }
            });
        });
    };

    initApp();
});
