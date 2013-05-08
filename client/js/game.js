define(['../../shared/js/model','scene', '../../shared/js/map', '../../shared/js/tilefactory', 'gameclient', '../../shared/js/player', '../../shared/js/gametypes'],
    function (Model,Scene, Map, TileFactory, GameClient, Player) {

        var Game = Model.extend({
            init: function (app) {
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

                this.client = null;

                this.entities = {};
            },

            setup: function (entities, background, foreground) {
                this.scene = new Scene(768,768);
                this.scene.newLayer('entities', entities);
                this.scene.newLayer('background', background);
                this.scene.newLayer('foreground', foreground);
            },

            loadMap: function () {
                var self = this;

                var filePath = '../../shared/maps/level1.json';

                $.get(filePath, function (data) {
                    self.map = new Map(self);

                    self.map.on('init',function () {
                        self.mapGrid = self.map.tiles;
                        self.teamCount = self.map.teamCount;
                        console.info("Map loaded.");
                    });

                    self.map.setData(data);
                }, 'json');


            },

            initMap: function () {
                var self = this,
                    kind,
                    element,
                    mId = 1,
                    id;

                for (var j, i = 0; i < self.map.height; i++) {
                    for (j = 0; j < self.map.width; j++) {
                        if ((kind = Types.getKindAsString(self.map.tiles[i][j])) !== undefined) {
                            id = 5000 + mId + String(i) + String(j);
                            element = TileFactory.create(id, kind, i, j);
                            self.addToEntityGrid(element);
                            self.addEntity(element);

                            if(kind === 'trees'){
                                this.scene.addToLayer(element,'foreground');
                            }else{
                                this.scene.addToLayer(element,'background');
                            }
                            mId++;
                        }
                    }
                }
            },

            initGrids: function () {
                this.tiles = [];
                this.entityGrid = [];
                for (var i = 0; i < this.map.height; i++) {
                    this.tiles[i] = [];
                    this.entityGrid[i] = [];
                    for (var j = 0; j < this.map.width; j++) {
                        this.tiles[i][j] = {};
                        this.entityGrid[i][j] = {};
                    }
                }
            },

            unregisterEntityPosition: function(entity) {
                if(entity) {
                    _.each(entity.getChunk(), function(pos){
                        this.removeFromEntityGrid(entity, pos[0], pos[1]);
                    },this);
                }
            },

            addToEntityGrid: function(entity) {
                if(entity) {
                    _.each(entity.getChunk(), function(pos){
                        this.entityGrid[pos[0]][pos[1]][entity.id] = entity;
                    },this);
                }
            },

            removeFromEntityGrid: function (entity, x, y) {
                if (this.entityGrid[x][y][entity.id]) {
                    delete this.entityGrid[x][y][entity.id];
                }
            },

            run: function (started_callback) {
                var self = this;

                this.ready = true;
                this.connect(started_callback);

                var waitGameLoadData = setInterval(function () {
                    if (self.loadData) {

                        var waitStartGame = setInterval(function () {
                            if (self.map && self.map.isLoaded && self.started) {
                                self.start();
                                self.sendLoad();
                                clearInterval(waitStartGame);
                            }
                        }, 1000);

                        clearInterval(waitGameLoadData);
                    }
                }, 100);
            },

            start: function () {
                this.initGrids();
                this.initMap();
                this.tick();
                this.sendLoad();
                console.info("Game loop started.");
            },

            tick: function () {
                if (this.started) {
                    this.scene.refreshFrame();
                }
                requestAnimFrame(this.tick.bind(this));
            },

            connect: function (connect_func) {
                var self = this;

                this.client = new GameClient('127.0.0.1', '8000');
                this.client.connect();

                this.client.onConnected(function () {
                    if (connect_func) {
                        connect_func();
                    }

                    self.client.sendHello();

                    console.info("Starting client/server handshake");
                });

                this.client.onWelcome(function (playerConfig) {
                    self.player = playerConfig;
                    self.connected = true;

                    self.emit('playerWelcome',self.player);
                });

                this.client.onLoadGameData(function (id, population, teamCount, minPlayers, maxPlayers, players) {
                    self.id = id;
                    self.setPopulation(population);
                    self.teamCount = teamCount;
                    self.minPlayers = minPlayers;
                    self.maxPlayers = maxPlayers;

                    _.each(players, function (playerConfig) {
                        self.entities[playerConfig.id] = playerConfig;
                    });

                    self.loadData = true;

                    self.emit('load');
                });

                this.client.onStarted(function () {
                    self.started = true;
                    self.emit('start');
                });

                this.client.onJoinGame(function (playerConfig) {
                    self.entities[playerConfig.id] = playerConfig;
                    self.incrementPopulation();

                    self.emit('playerJoin',playerConfig)
                });

                this.client.onLeftGame(function (playerId) {
                    self.decrementPopulation();

                    delete self.entities[playerId];

                    self.emit('playerLeft',playerId);
                });

                this.client.onReady(function (playerId) {
                    self.emit('playerReady',playerId);
                });

                this.client.onGamePlay(function () {
                    self.emit('play');
                });

                this.client.onSpawn(function (id, x, y, orientation) {
                    if (self.entityIdExists(id)) {
                        var player = new Player(self.entities[id]);
                        if (id === self.player.id) {
                            self.player = player;
                        }
                        player.setPosition(x, y);
                        player.setOrientation(orientation);
                        self.addToEntityGrid(player);
                        self.addEntity(player);

                        self.scene.addToLayer(player,'entities');
                    }
                });

                this.client.onChatMessage(function(id, message){
                    self.emit('chatMessage',id, message);
                });

                this.client.onMove(function (id, orientation) {
                    self.playerMove(id, orientation);
                });
            },

            addEntity: function (entity) {
                this.entities[entity.id] = entity;
            },

            incrementPopulation: function () {
                this.setPopulation(this.population + 1);
            },

            decrementPopulation: function () {
                this.setPopulation(this.population - 1);
            },

            setPopulation: function (newPopulation) {
                this.population = newPopulation;
                this.emit('changePopulation', this.population);
            },

            sendReady: function () {
                this.client.sendReady();
            },

            sendLoad: function () {
                this.client.sendLoad();
            },

            sendChatMessage: function (message) {
                this.client.sendChatMessage(message);
            },

            entityIdExists: function (id) {
                return id in this.entities;
            },

            getEntityById: function (id) {
                if (id in this.entities) {
                    return this.entities[id];
                }
                else {
                    log.error("Unknown entity id : " + id, true);
                }
            },

            playerMoveUp: function (id) {
                this.playerMove(id, Types.Orientations.UP);
            },
            playerMoveLeft: function (id) {
                this.playerMove(id, Types.Orientations.LEFT);
            },
            playerMoveRight: function (id) {
                this.playerMove(id, Types.Orientations.RIGHT);
            },
            playerMoveDown: function (id) {
                this.playerMove(id, Types.Orientations.DOWN);
            },

            playerMove: function (id, orientation) {
                var player = id ? this.entities[id] : this.player;
                if (this.isValidPlayerMove(player, orientation)) {
                    this.unregisterEntityPosition(player);
                    player.setOrientation(orientation);
                    player.move();
                    this.addToEntityGrid(player);
                }
                if (!id) {
                    this.client.sendMove(orientation)
                }
            },

            isValidPlayerMove: function (player, orientation) {
                if (this.map && player) {
                    var chunk = player.getChunk();

                    if (orientation === Types.Orientations.LEFT) {
                        return !this.map.isTankColliding.call(this.map, chunk[0][0] - 1, chunk[0][1]) && !this.map.isTankColliding.call(this.map, chunk[2][0] - 1, chunk[2][1]);
                    }
                    else if (orientation === Types.Orientations.UP) {
                        return !this.map.isTankColliding.call(this.map, chunk[0][0], chunk[0][1] - 1) && !this.map.isTankColliding.call(this.map, chunk[1][0], chunk[1][1] - 1);
                    }
                    else if (orientation === Types.Orientations.RIGHT) {
                        return !this.map.isTankColliding.call(this.map, chunk[1][0] + 1, chunk[1][1]) && !this.map.isTankColliding.call(this.map, chunk[3][0] + 1, chunk[3][1]);
                    }
                    else if (orientation === Types.Orientations.DOWN) {
                        return !this.map.isTankColliding.call(this.map, chunk[2][0], chunk[2][1] + 1) && !this.map.isTankColliding.call(this.map, chunk[3][0], chunk[3][1] + 1);
                    }
                }
            }
        });

        return Game;
    });
