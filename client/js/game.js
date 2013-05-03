define(['../../shared/js/model','renderer', '../../shared/js/map', '../../shared/js/tilefactory', 'gameclient', '../../shared/js/player', 'sprite', '../../shared/js/gametypes'],
    function (Model,Renderer, Map, TileFactory, GameClient, Player, Sprite) {

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
                this.renderer = null;

                this.client = null;

                // Game state
                this.entities = {};
                this.sprites = {};
                this.rendering = {};

                this.animatedTiles = null;

                this.spriteNames = ["armoredwall", "ice", "trees", "wall", "water", "tank"]
            },

            onLoad: function (func) {
                this.load_func = func;
            },

            onRun: function (func) {
                this.running_func = func;
            },

            onStart: function (func) {
                this.start_func = func;
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

            setup: function (entities, background, foreground) {
                this.setRenderer(new Renderer(this, entities, background, foreground));
            },


            setRenderer: function (renderer) {
                this.renderer = renderer;
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
                            if (kind !== "empty") {
                                id = 5000 + mId + String(i) + String(j);
                                element = TileFactory.create(id, kind, i, j);
                                element.setSprite(this.sprites[kind]);
                                self.registerEntityDualPosition(element);
                                self.addEntity(element);
                                mId++;
                            }
                        } else {
                            console.error("Tile is not defined");
                        }

                    }
                }
                console.info("Collision grid generated.");
            },

            initEntityGrid: function () {
                this.entityGrid = [];
                for (var i = 0; i < this.map.height; i++) {
                    this.entityGrid[i] = [];
                    for (var j = 0; j < this.map.width; j++) {
                        this.entityGrid[i][j] = {};
                    }
                }
                console.info("Initialized the entity grid.");
            },

            initTilesGrid: function () {
                this.tiles = [];
                for (var i = 0; i < this.map.height; i++) {
                    this.tiles[i] = [];
                    for (var j = 0; j < this.map.width; j++) {
                        this.tiles[i][j] = {};
                    }
                }
                console.info("Initialized the tiles grid.");
            },


            initRendering: function () {
                this.renderingGrid = [];
                for (var i = 0; i < this.map.height; i++) {
                    this.renderingGrid[i] = [];
                    for (var j = 0; j < this.map.width; j++) {
                        this.renderingGrid[i][j] = {};
                    }
                }
                console.info("Initialized the rendering grid.");
            },

            addToRenderingGrid: function (entity, x, y) {
                if (this.entityGrid[x][y][entity.id]) {
                    this.renderingGrid[x][y][entity.id] = entity;
                }
            },

            removeFromRenderingGrid: function (entity, x, y) {
                if (entity && this.renderingGrid[x][y] && entity.id in this.renderingGrid[y][x]) {
                    delete this.renderingGrid[x][y][entity.id];
                }
            },

            removeFromEntityGrid: function (entity, x, y) {
                if (this.entityGrid[x][y][entity.id]) {
                    delete this.entityGrid[x][y][entity.id];
                }
            },

            unregisterEntityPosition: function(entity) {
                var self = this;
                if(entity) {
                    _.each(entity.getChunk(), function(pos){
                        self.removeFromEntityGrid(entity, pos[0], pos[1]);
                    });

                    this.removeFromRenderingGrid(entity, entity.x, entity.y);
                }
            },

            registerEntityDualPosition: function(entity) {
                var self = this;

                if(entity) {
                    _.each(entity.getChunk(), function(pos){
                        self.entityGrid[pos[0]][pos[1]][entity.id] = entity;
                    });
                    this.addToRenderingGrid(entity, entity.x, entity.y);
                }
            },


            run: function (started_callback) {
                var self = this;

                this.loadSprites();
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

                if (this.running_func) {
                    this.running_func();
                }
            },

            start: function () {
                this.initTilesGrid();
                this.initRendering();
                this.initEntityGrid();
                this.initMap();
                this.tick();
                this.sendLoad();
                console.info("Game loop started.");
            },

            tick: function () {
                if (this.started) {
                    this.renderer.renderFrame();
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

                    if (self.load_func) {
                        self.load_func();
                    }
                });

                this.client.onStarted(function () {
                    self.started = true;

                    if (self.start_func) {
                        self.start_func();
                    }

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
                        player.setSprite(self.sprites[Types.getKindAsString(player.kind)]);
                        self.registerEntityDualPosition(player);
                        self.addEntity(player);
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
                var self = this;

                this.entities[entity.id] = entity;
                entity.dirtyRect = self.renderer.getEntityBoundingRect(entity);
                entity.onDirty(function (e) {
                    e.dirtyRect = self.renderer.getEntityBoundingRect(e);
                    self.checkOtherDirtyRects(entity);
                });
            },

            checkOtherDirtyRects: function(source){
                /**
                 * @TODO Обязательно переделать!!!!!!!!!!!
                 */
                var self = this;
                for (var i = source.x-2; i < source.x+3; i++) {
                    for (var j = source.y-2; j < source.y+3; j++) {
                        if(!this.map.isOutOfBounds(i,j)){
                            _.each(this.renderingGrid[i][j], function (entity) {
                                if(entity.id !== source.id && entity.layer === source.layer){
                                    console.log('check');
                                    entity.dirtyRect = self.renderer.getEntityBoundingRect(entity);
                                    entity.isDirty = true;
                                }
                            });
                        }
                    }
                }
            },

            forEachVisibleEntity: function (callback) {
                for (var i = 0; i < this.map.height; i++) {
                    for (var j = 0; j < this.map.width; j++) {
                        _.each(this.renderingGrid[i][j], function (entity) {
                            callback(entity);
                        });
                    }
                }

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
                    this.registerEntityDualPosition(player);
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
            },

            loadSprite: function (name) {
                this.sprites[name] = new Sprite(name, 3);
            },

            loadSprites: function () {
                _.map(this.spriteNames, this.loadSprite, this);
                console.log('sprites load');
            }


        });

        return Game;
    });
