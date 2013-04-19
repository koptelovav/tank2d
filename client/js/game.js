
define(['renderer','map','mapelement','gameclient','player','../../shared/js/gametypes'],
function(Renderer,Map,MapElementFactory,GameClient,Player) {

    var Game = Class.extend({
        init: function(app) {
            this.app = app;
            this.ready = false;
            this.started = false;
            this.connected = false;
            this.canStart = false;
            this.isLoad = false;

            this.population = 0;
            this.maxPlayers = null;
            this.minPlayers = null;

            this.player = null;
            this.renderer = null;

            this.client = null;

            // Game state
            this.entities = {};
        },

        onLoad: function(func){
            this.load_func = func;
        },

        onRun: function(func){
            this.running_func = func;
        },

        onStart: function(func){
            this.start_func = func;
        },

        onWait: function(func){
            this.wait_func = func;
        },

        onChangePopulation: function(func){
            this.changepopulation_func = func;
        },

        onPlayerJoin: function(func){
            this.playerjoin_func = func;
        },

        onPlayerLeft: function(func){
            this.playerleft_func = func;
        },

        onPlayerWelcome: function(func){
            this.playerwelcome_func = func;
        },

        onPlayerReady: function(func){
            this.playerready_func = func;
        },

        onPlayerRender: function(func){
            this.playerrender_func = func;
        },

        onGamePlay: function(func){
            this.gameplay_func = func;
        },

        loadMap: function() {
            var self = this;

            this.map = new Map(this);

            this.map.ready(function() {
                self.mapGrid = self.map.tiles;
                self.teamCount = self.map.teamcount;
                self.generateStaticGrid();
                console.info("Map loaded.");
            });
        },

        setup: function(canvas, background) {
            this.setRenderer(new Renderer(this, canvas, background));
        },


        setRenderer: function(renderer){
            this.renderer = renderer;
        },

        run: function(started_callback) {
            var self = this;

            self.ready = true;
            self.connect(started_callback);

            if(self.running_func){
                self.running_func();
            }
        },

        generateStaticGrid: function() {
            var self = this,
                kind;

            for (var j, i = 0; i < self.map.height; i++) {
                for (j = 0; j < self.map.width; j++) {
                    if ((kind = Types.getKindAsString(self.mapGrid[i][j])) !== undefined) {
                        self.mapGrid[i][j] = MapElementFactory.create(kind);
                    } else {
                        self.mapGrid[i][j] = undefined;
                    }
                }
            }
            console.info("Collision grid generated.");
        },

        wait: function(){
            var self = this;

            console.log('game wait');

            if(this.wait_func)
                this.wait_func();

            var wait = setInterval(function() {
                if(self.map && self.map.isLoaded && self.started) {
                    self.start();
                    clearInterval(wait);
                }
            }, 100);
        },

        start: function(){
            this.tick();
            console.info("Game loop started.");
        },

        tick: function() {
            var self = this;

            if(this.started) {
                this.renderer.renderFrame(function(){
                    self.sendLoad()
                });
            }
        },

        connect: function(connect_func){
            var self = this;

            this.client = new GameClient('172.17.3.61','8000');
            this.client.connect();

            this.client.onConnected(function() {
                if(connect_func){
                    connect_func();
                }

                self.client.sendHello();

                console.info("Starting client/server handshake");
            });

            this.client.onWelcome(function(playerConfig){
                self.player = new Player(playerConfig);

                self.connected = true;

                if(self.playerwelcome_func){
                    self.playerwelcome_func(self.player);
                }

                self.wait();
            });

            this.client.onLoadGameData(function(id, population,teamCount, minPlayers, maxPlayers, players){
                self.id = id;
                self.setPopulation(population);
                self.teamCount = teamCount;
                self.minPlayers = minPlayers;
                self.maxPlayers = maxPlayers;

                _.each(players, function(playerConfig){
                    self.entities[playerConfig.id] = new Player(playerConfig);
                });

                if(self.load_func){
                    self.load_func();
                }
            });

            this.client.onStarted(function(){
                self.started = true;

                if(self.start_func){
                    self.start_func();
                }

            });

            this.client.onJoinGame(function(playerConfig){
                self.incrementPopulation();

                if(self.playerjoin_func){
                    self.playerjoin_func(playerConfig);
                }
            });

            this.client.onLeftGame(function(playerId){
                self.decrementPopulation();

                if(self.playerleft_func){
                    self.playerleft_func(playerId);
                }
            });

            this.client.onReady(function(playerId){
                if(self.playerready_func){
                    self.playerready_func(playerId);
                }
            });

            this.client.onGamePlay(function(){
                if(self.gameplay_func){
                    self.gameplay_func();
                }
            });
        },

        forEachTiles: function(callback){
            for (var j, i = 0; i < this.map.height; i++) {
                for (j = 0; j < this.map.width; j++) {
                    callback(this.mapGrid[i][j], i, j);
                }
            }
        },

        incrementPopulation: function(){
            this.setPopulation(this.population+1);
        },

        decrementPopulation: function(){
            this.setPopulation(this.population-1);
        },

        setPopulation: function(newPopulation){
            this.population = newPopulation;

            if(this.changepopulation_func){
                this.changepopulation_func()
            }
        },

        sendReady: function(){
            this.client.sendReady();
        },

        sendLoad: function(){
            this.client.sendLoad();
        }
    });
    
    return Game;
});
