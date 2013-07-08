define(['../../shared/js/gamebase', '../../shared/js/bullet', 'spritemanager', 'scene', '../../shared/js/map', '../../shared/js/tilefactory', '../../shared/js/player', 'connection', '../../shared/js/gametypes'],
    function (GameBase, Bullet, SpriteManager, Scene, Map, TileFactory, Player, Connection) {

        var Game = GameBase.extend({
            init: function (app) {
                this.app = app;
                this.env = Types.Environment.CLIENT;
                this.spriteManager = new SpriteManager();
                this.connection = new Connection('127.0.0.1', '8000');
                this.ready = false;
                this.started = false;
                this.connected = false;
                this.isLoad = false;

                this.player = null;

                this.population = 0;
                this.maxPlayers = null;
                this.minPlayers = null;

                this.entityGrid = [];
                this.collections = {};
                this.teams = {};

                this.lastUpdateTime = 0;

                this.spriteNames = ["armoredwall", "ice", "trees", "wall", "water", "tank", "bullet", "base"];
            },

            setup: function (entities, background, foreground) {
                this.scene = new Scene(768, 768);
                this.scene.newLayer(Types.Layers.ENTITIES, entities);
                this.scene.newLayer(Types.Layers.BACKGROUND, background);
                this.scene.newLayer(Types.Layers.FOREGROUND, foreground);
            },

            run: function () {
                var self = this;

                this.ready = true;
                this.connect();

                this.spriteManager.addResource(this.spriteNames).load();

                var waitGameLoadData = setInterval(function () {
                    var waitStartGame = setInterval(function () {
                        if (self.map && self.map.isLoaded && self.started) {
                            self.start();
                            self.connection.send(Types.Messages.LOADMAP);
                            clearInterval(waitStartGame);
                        }
                    }, 1000);
                    clearInterval(waitGameLoadData);
                }, 100);
            },

            start: function () {
                this.initEntityGrid();
                this.initMap();
                this.tick();
            },

            tick: function () {
                if (this.started) {
                    var now = Date.now();
                    var dt = (now - this.lastUpdateTime) / 1000.0;

                    this.emit('tick');
                    this.moveEntities(dt);
                    this.scene.refreshFrame();

                    this.lastUpdateTime = now;
                }
                requestAnimFrame(this.tick.bind(this));
            },

            connect: function () {
                this.connection.connect();

                this.connection.on('connect', function () {
                    this.connection.send(Types.Messages.HELLO);
                }, this);

                this.connection.on('welcome', function (playerData) {
                    this.connected = true;
                    this.player = this.addPlayer(playerData);
                    this.emit('playerWelcome');
                }, this);

                this.connection.on('gameData', function (id, population, teamCount, minPlayers, maxPlayers, players) {
                    this.id = id;
                    this.setPopulation(population);
                    this.teamCount = teamCount;
                    this.minPlayers = minPlayers;
                    this.maxPlayers = maxPlayers;

                    _.each(players, function (playerData) {
                        this.addPlayer(playerData);
                    }, this);

                    this.emit('load');
                }, this);

                this.connection.on('gameStart', function () {
                    this.started = true;
                    this.emit('start');
                }, this);

                this.connection.on('sendMap', function (data) {
                    this.loadMap(data);
                }, this);

                this.connection.on('joinGame', function (playerData) {
                    this.addPlayer(playerData);
                    this.incrementPopulation();
                }, this);

                this.connection.on('leftGame', function (playerId) {
                    this.decrementPopulation();
                    this.removeEntity(this.getEntityById(playerId));

                    this.emit('playerLeft', playerId);
                }, this);

                this.connection.on('iReady', function (playerId) {
                    this.emit('playerReady', playerId);
                }, this);

                this.connection.on('gamePlay', function () {
//                    this.connection.send(Types.Messages.SENDMAP);
                    this.emit('play');
                }, this);

                this.connection.on('spawn', function (id, x, y, orientation) {
                    var player;
                    if (this.entityIdExists(id)) {
                        player = this.getEntityById(id);
                        player.setPosition(x, y);
                        player.setOrientation(orientation);
                        this.addEntity(player, true);


                        player.on('move', function () {
                            this.registerEntityPosition(player);
                        }, this);
                    }
                }, this);

                this.connection.on('chat', function (id, message) {
                    this.emit('chatMessage', id, message);
                }, this);

                this.connection.on('move', function (id, orientation) {
                    this.playerMove(id, orientation);
                }, this);

                this.connection.on('endMove', function (id) {
                    this.playerStopMove(id);
                }, this);

                this.connection.on('syncPos', function (id, x, y, gridX, gridY) {
                }, this);
            },

            loadMap: function (data) {
                this.map = new Map(this);
                this.map.setData(data);
            },

            addToScene: function (entity) {
                var element = this.scene.createElement(entity);
                element.setSprite(this.spriteManager.getSprite(Types.getKindString(entity.kind)));
                element.setAnimation('idle', 800);
                this.scene.addToLayer(element, entity.layer);
            },

            removeFromScene: function (entity) {
                this.scene.removeFromLayer(entity, entity.layer);
            },

            moveEntities: function (dt) {
                _.each(this.collections[Types.Collections.MOVABLE], function (entity) {
                    if (entity.isMovable) {
                        if (entity instanceof Player) {
                            if (this.isValidPlayerMove(entity)) {
                                entity.move(dt);
                            }
                        } else if (entity instanceof Bullet) {
                            if (!this.map.isOutOfBounds.apply(this.map, entity.move(dt, true))) {
                                var hit = this.map.isBulletColliding.call(this.map, entity);
                                if (_.isObject(hit) && !_.isEmpty(hit)) {
                                    _.each(hit, function (item) {
                                        item.processImpact(entity.impact);
                                        if(item.life <= 0)
                                            this.removeEntity(item);
                                    }, this);
                                }
                                else {
                                    entity.move(dt);
                                    return;
                                }
                            }
                            entity.destroyFn();
                            this.removeEntity(entity);
                        }
                    }

                }, this);
            },

            addPlayer: function (d) {
                var player = new Player(d[0], d[1], d[2], d[5], d[6]);
                player.setPosition(d[3], d[4]);
                this.addEntity(player);
                this.emit('playerJoin', player);
                return player;
            },

            sendReady: function () {
                this.connection.send(Types.Messages.IREADY);
            },

            playerFire: function (id) {
                if (this.player.canFire()) {
                    this.player.toggleFire();
                    var bullet = new Bullet(Date.now(), 'easy', Types.Entities.BULLET, this.player, 300);
                    this.addEntity(bullet);
                    this.addToScene(bullet);
                }
            },

            playerStopMove: function (id) {
                var player = id ? this.collections[Types.Collections.PLAYER][id] : this.player;

                if (player.isMovable) {
                    player.toggleMovable();
                    if (!id) {
//                        this.listener.sendEndMove();
                    }
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
                var player = id ? this.getEntityById(id) : this.player;
                player.setOrientation(orientation);

                if (!player.isMovable) {
                    player.toggleMovable();
                    if (!id) {
                        this.connection.send(Types.Messages.MOVE, orientation);
                    }
                }
            },

            isValidPlayerMove: function (player) {
                if (this.map && player) {
                    var chunk = player.getChunk(true),
                        result = _.any(chunk, function (tile) {
                            if (this.map.isOutOfBounds(tile.x, tile.y)) {
                                return true;
                            }
                            for (var id in this.entityGrid[tile.x][tile.y]) {
                                if (player.id != id && this.entityGrid[tile.x][tile.y][id].colliding.indexOf(Types.Entities.TANK) >= 0)
                                    return true;
                            }
                            return false;
                        }, this);
                    return !result;
                }
                return false;
            },

            sendChatMessage: function (message) {
                this.connection.send(Types.Messages.CHAT, message);
            }
        });

        return Game;
    });
