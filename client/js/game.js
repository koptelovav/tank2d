
define(['renderer','map','tilefactory','gameclient','player','sprite','../../shared/js/gametypes'],
function(Renderer,Map,TileFactory,GameClient,Player, Sprite) {

    var Game = Class.extend({
        init: function(app) {
            this.app = app;
            this.ready = false;
            this.started = false;
            this.connected = false;
            this.canStart = false;
            this.isLoad = false;


            this.loadData = false;

            this.population = 0;
            this.maxPlayers = null;
            this.minPlayers = null;

            this.player = null;
            this.renderer = null;

            this.client = null;

            // Game state
            this.entities = {};
            this.sprites = {};
            this.rendering = {};

            this.animatedTiles = null;

            this.spriteNames = ["armoredwall","ice","trees","wall","water","tank"]
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
                console.info("Map loaded.");
            });
        },

        setup: function(entities, background, foreground) {
            this.setRenderer(new Renderer(this, entities, background, foreground));
        },


        setRenderer: function(renderer){
            this.renderer = renderer;
        },

        initMap: function() {
            var self = this,
                kind,
                element,
                mId = 1,
                id;

            for (var j, i = 0; i < self.map.height; i++) {
                for (j = 0; j < self.map.width; j++) {
                        if ((kind = Types.getKindAsString(self.map.tiles[i][j])) !== undefined) {
                            if(kind !== "empty"){
                                id = 5000+mId+String(i)+String(j);
                                element = TileFactory.create(id, kind, i, j);
                                element.setSprite(this.sprites[kind]);
                                self.tiles[i][j][element.id] = element;
                                self.entities[element.id] = element;
                                self.rendering[element.id] = element;
                                mId++;
                            }
                        }else {
                            console.error("Tile is not defined");
                        }

                }
            }
            console.info("Collision grid generated.");
        },

        initEntityGrid: function() {
            this.entityGrid = [];
            for(var i=0; i < this.map.height; i += 1) {
                this.entityGrid[i] = [];
                for(var j=0; j < this.map.width; j += 1) {
                    this.entityGrid[i][j] = {};
                }
            }
            console.info("Initialized the entity grid.");
        },

        initTilesGrid: function() {
            this.tiles = [];
            for(var i=0; i < this.map.height; i += 1) {
                this.tiles[i] = [];
                for(var j=0; j < this.map.width; j += 1) {
                    this.tiles[i][j] = {};
                }
            }
            console.info("Initialized the tiles grid.");
        },


        initRendering: function() {
            this.renderingGrid = [];
            for(var i=0; i < this.map.height; i += 1) {
                this.renderingGrid[i] = [];
                for(var j=0; j < this.map.width; j += 1) {
                    this.renderingGrid[i][j] = {};
                }
            }
            console.info("Initialized the rendering grid.");
        },

        addToRenderingGrid: function(entity, x, y) {
            this.renderingGrid[entity.id] = entity;
        },

        removeFromRenderingGrid: function(entity, x, y) {
            if(entity && this.renderingGrid[x][y] && entity.id in this.renderingGrid[y][x]) {
                delete this.renderingGrid[x][y][entity.id];
            }
        },

        removeFromEntityGrid: function(entity, x, y) {
            if(this.entityGrid[y][x][entity.id]) {
                delete this.entityGrid[y][x][entity.id];
            }
        },

        run: function(started_callback) {
            var self = this;

            this.loadSprites();
            this.ready = true;
            this.connect(started_callback);

            var waitGameLoadData= setInterval(function(){
                if(self.loadData){

                    if(self.wait_func)
                        self.wait_func();

                    var waitStartGame = setInterval(function() {
                        if(self.map && self.map.isLoaded && self.started) {
                            self.start();
                            self.sendLoad();
                            clearInterval(waitStartGame);
                        }
                    }, 1000);

                    clearInterval(waitGameLoadData);
                }
            },100);

            if(this.running_func){
                this.running_func();
            }
        },

        start: function(){
            this.initTilesGrid();
            this.initRendering();
            this.initMap();
            this.tick();
            this.sendLoad();
            console.info("Game loop started.");
        },

        tick: function() {
            if(this.started) {
                this.renderer.renderFrame();
            }
           requestAnimFrame(this.tick.bind(this));
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
                self.player = playerConfig;
          /*      self.player = new Player(playerConfig);
                self.player.setSprite(self.sprites[Types.getKindAsString(self.player.kind)]);*/

                self.connected = true;

                if(self.playerwelcome_func){
                    self.playerwelcome_func(self.player);
                }
            });

            this.client.onLoadGameData(function(id, population,teamCount, minPlayers, maxPlayers, players){
                self.id = id;
                self.setPopulation(population);
                self.teamCount = teamCount;
                self.minPlayers = minPlayers;
                self.maxPlayers = maxPlayers;

                _.each(players, function(playerConfig){
                    self.entities[playerConfig.id] = playerConfig;
                  /*  self.entities[playerConfig.id].setSprite(self.sprites[Types.getKindAsString(self.entities[playerConfig.id].kind)]);*/
                });

                self.loadData = true;

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
                self.entities[playerConfig.id] = playerConfig;
                /*self.entities[playerConfig.id] = new Player(playerConfig);
                self.entities[playerConfig.id].setSprite(self.sprites[Types.getKindAsString(self.entities[playerConfig.id].kind)]);*/
                self.incrementPopulation();

                if(self.playerjoin_func){
                    self.playerjoin_func(playerConfig);
                }
            });

            this.client.onLeftGame(function(playerId){
                self.decrementPopulation();

                delete self.entities[playerId];

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

            this.client.onSpawn(function(id, x, y, orientation){
                if(self.entityIdExists(id)){
                    self.entities[id] = new Player(self.entities[id]);
                    if(id === self.player.id){
                        self.player = self.entities[id];
                    }

                    self.entities[id].setPosition(x, y);
                    self.entities[id].setOrientation(orientation);
                    self.entities[id].setSprite(self.sprites[Types.getKindAsString(self.entities[id].kind)]);
                    self.spawnEntity(self.entities[id]);
                }
            });

            this.client.onMove(function(id, orientation){
                console.log(id, orientation);
                self.playerMove(id,orientation);
            });
        },

        forEachVisibleEntity: function(callback){
            _.each(this.rendering, function(entity){
                callback(entity);
            });
        },

        spawnEntity: function(entity){
            this.rendering[entity.id] = entity;
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
        },

        entityIdExists: function(id) {
            return id in this.entities;
        },

        getEntityById: function(id) {
            if(id in this.entities) {
                return this.entities[id];
            }
            else {
                log.error("Unknown entity id : " + id, true);
            }
        },

        playerMoveUp:function(id){
            this.playerMove(id,Types.Orientations.UP);
        },
        playerMoveLeft:function(id){
            this.playerMove(id,Types.Orientations.LEFT);
        },
        playerMoveRight:function(id){
            this.playerMove(id,Types.Orientations.RIGHT);
        },
        playerMoveDown:function(id){
            this.playerMove(id,Types.Orientations.DOWN);
        },

        playerMove:function(id,orientation){
            var player = id ? this.entities[id] : this.player;
            if(this.isValidPlayerMove(player,orientation)){
                player.setOrientation(orientation);
                player.move();
                if(!id){
                    this.client.sendMove(orientation)
                }
            }
        },


        isValidPlayerMove: function(player, orientation){
            if(this.map && player) {
                var chunk = player.getChunk();

                if(orientation === Types.Orientations.LEFT){
                    return !this.map.isPlayerColliding.call(this.map,chunk[0][0]-1,chunk[0][1]) &&
                        !this.map.isPlayerColliding.call(this.map,chunk[2][0]-1,chunk[2][1]);
                }
                else if(orientation === Types.Orientations.UP){
                    return !this.map.isPlayerColliding.call(this.map,chunk[0][0],chunk[0][1]-1) &&
                        !this.map.isPlayerColliding.call(this.map,chunk[1][0],chunk[1][1]-1);
                }
                else if(orientation === Types.Orientations.RIGHT){
                    return !this.map.isPlayerColliding.call(this.map,chunk[1][0]+1,chunk[1][1]) &&
                        !this.map.isPlayerColliding.call(this.map,chunk[3][0]+1,chunk[3][1]);
                }
                else if(orientation === Types.Orientations.DOWN){
                    return !this.map.isPlayerColliding.call(this.map,chunk[2][0],chunk[2][1]+1) &&
                        !this.map.isPlayerColliding.call(this.map,chunk[3][0],chunk[3][1]+1);
                }
            }
        },

        loadSprite: function(name) {
            this.sprites[name] = new Sprite(name, 3);
        },

        loadSprites: function() {
            _.map(this.spriteNames, this.loadSprite, this);
            console.log('sprites load');
        }
    });
    
    return Game;
});
