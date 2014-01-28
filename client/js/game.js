define(['baseGame', 'bullet', 'spritemanager', 'scene', 'map', 'tilefactory', 'player', 'connection','effectFactory', 'audioManager','gametypes'],
    function (baseGame, Bullet, SpriteManager, Scene, Map, TileFactory, Player, Connection,EffectFactory,AudioManager) {

        var Game = baseGame.extend({
            init: function (app) {
                this.app = app;
                this.env = CONST.ENVIRONMENT.CLIENT;
                this.connection = new Connection('127.0.0.1', '9000');

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

                this.spriteNames = ["armoredwall", "ice", "trees", "wall", "water", "tank", "bullet", "base","bang","bigbang"];

                this.on('addEntity', function(entity){
                    if(this.ready){
                        switch(entity.type){
                            case CONST.TYPES.PLAYER:
                            case CONST.TYPES.BULLET:
                                this.initMovableEntity(entity);
                                break;
                            case CONST.TYPES.EFFECT:
                                this.initEffectEntity(entity);
                                break;
                            case CONST.TYPES.TILE:
                                this.initStaticEntity(entity);
                                break;
                        }

                        entity.on('destroy',function(){
                            this.effectFactory.create(entity, CONST.ACTIONS.DESTROY);
                        }, this);

                        this.scene.add(entity);
                    }
                }, this);

                this.on('removeEntity', function(entity){
                    this.scene.remove(entity);
                }, this);

                this.on('baseDestroy',function(team){
                    this.audioManager.playSound("explosion_2");
                    this.audioManager.playSound("game_over");
                });
            },

            initMovableEntity: function(entity){
                entity.setAnimation('move_'+CONST.getOrientationString(entity.orientation), entity.speedAnimation);

                entity.on('beginMove', function(){
                    entity.animated = true;
                });

                entity.on('endMove', function(){
                    entity.animated = false;
                });

                entity.on('changeOrientation',function(){
                    if (entity.orientation === CONST.ORIENTATIONS.LEFT)  entity.setAnimation('move_left', 50);
                    else if (entity.orientation === CONST.ORIENTATIONS.UP)  entity.setAnimation('move_up', 50);
                    else if (entity.orientation === CONST.ORIENTATIONS.RIGHT)  entity.setAnimation('move_right', 50);
                    else if (entity.orientation === CONST.ORIENTATIONS.DOWN)  entity.setAnimation('move_down', 50);
                });

                entity.on('shift changeOrientation', function(){
                    entity._setDirty();
                });
            },

            initStaticEntity: function(entity){
                entity.setAnimation('idle', entity.speedAnimation);
            },

            initEffectEntity: function(entity){
                var self = this;
                entity.setAnimation('idle', entity.speedAnimation, 1, function(){
                    self.emit('removeEntity',entity);
                });
            },

            setup: function (entities, effects, background, foreground) {
                this.audioManager = new AudioManager();
                this.scene = new Scene();
                this.effectFactory = new EffectFactory(this);

                this.scene.setSize(768, 768);
                this.scene.newLayer(CONST.LAYERS.ENTITIES, entities);
                this.scene.newLayer(CONST.LAYERS.EFFECTS, effects);
                this.scene.newLayer(CONST.LAYERS.BACKGROUND, background);
                this.scene.newLayer(CONST.LAYERS.FOREGROUND, foreground);
            },

            run: function () {
                var self = this;

                this.ready = true;
                this.connect();

                SpriteManager.addResource(this.spriteNames).load();

                var waitGameLoadData = setInterval(function () {
                    var waitStartGame = setInterval(function () {
                        if (self.map && self.map.isLoaded && self.started) {
                            self.start();
                            self.connection.send(CONST.MESSAGES.LOADMAP);
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
                this.audioManager.playSound("stage_start");
            },

            tick: function () {
                if (this.started) {
                    var now = Date.now();
                    var dt = (now - this.lastUpdateTime) / 1000.0;

                    this.emit('tick');
                    this.moveEntities(dt);
                    this.scene.refresh();

                    this.lastUpdateTime = now;
                }
                requestAnimFrame(this.tick.bind(this));
            },

            connect: function () {
                this.connection.connect();

                this.connection.on('connect', function () {
                    this.connection.send(CONST.MESSAGES.HELLO);
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
//                    this.connection.send(CONST.MESSAGES.SENDMAP);
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

            moveEntities: function (dt) {
                _.each(this.collections[CONST.COLLECTIONS.MOVABLE], function (entity) {
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
                                        if(item.life <= 0){
                                            this.removeEntity(item);
                                            this.audioManager.playSound("bullet_hit_2");
                                        }else{
                                            this.audioManager.playSound("bullet_hit_1");
                                        }
                                    }, this);
                                }
                                else {
                                    entity.move(dt);
                                    return;
                                }
                            }
                            entity.player.bulletCount -= 1;
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
                this.connection.send(CONST.MESSAGES.IREADY);
            },

            playerFire: function (id) {
                if (this.player.canFire()) {
                    this.player.bulletCount += 1;
                    var bullet = new Bullet(Date.now(), CONST.TYPES.BULLET, CONST.ENTITIES.BULLET, this.player, 300);
                    this.addEntity(bullet);
                }
            },

            playerStopMove: function (id) {
                var player = id ? this.collections[CONST.COLLECTIONS.PLAYER][id] : this.player;

                if (player.isMovable) {
                    player.toggleMovable();
                    if (!id) {
//                        this.listener.sendEndMove();
                    }
                }
            },
            playerMoveUp: function (id) {
                this.playerMove(id, CONST.ORIENTATIONS.UP);
            },
            playerMoveLeft: function (id) {
                this.playerMove(id, CONST.ORIENTATIONS.LEFT);
            },
            playerMoveRight: function (id) {
                this.playerMove(id, CONST.ORIENTATIONS.RIGHT);
            },
            playerMoveDown: function (id) {
                this.playerMove(id, CONST.ORIENTATIONS.DOWN);
            },

            playerMove: function (id, orientation) {
                var player = id ? this.getEntityById(id) : this.player;
                player.setOrientation(orientation);

                if (!player.isMovable) {
                    player.toggleMovable();
                    if (!id) {
                        this.connection.send(CONST.MESSAGES.MOVE, orientation);
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
                                if (player.id != id && this.entityGrid[tile.x][tile.y][id].colliding.indexOf(CONST.ENTITIES.TANK) >= 0)
                                    return true;
                            }
                            return false;
                        }, this);
                    return !result;
                }
                return false;
            },

            sendChatMessage: function (message) {
                this.connection.send(CONST.MESSAGES.CHAT, message);
            }
        });

        return Game;
    });
