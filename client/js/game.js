define(['../../shared/js/gamebase','../../shared/js/bullet','spritemanager','scene', '../../shared/js/map', '../../shared/js/tilefactory', '../../shared/js/player', 'connection','../../shared/js/gametypes'],
    function (GameBase,Bullet,SpriteManager,Scene, Map, TileFactory, Player, Connection) {

        var Game = GameBase.extend({
            init: function (app) {
                this.app = app;
                this.spriteManager = new SpriteManager();
                this.connection = new Connection('127.0.0.1','8000');
                this.ready = false;
                this.started = false;
                this.connected = false;
                this.isLoad = false;

                this.player = null;

                this.population = 0;
                this.maxPlayers = null;
                this.minPlayers = null;

                this.entities = {};
                this.movableEntities = {};

                this.spriteNames = ["armoredwall", "ice", "trees", "wall", "water", "tank", "bullet"];
            },

            setup: function (entities, background, foreground) {
                this.scene = new Scene(768,768);
                this.scene.newLayer('entities', entities);
                this.scene.newLayer('background', background);
                this.scene.newLayer('foreground', foreground);
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
                this.initGrids();
                this.initMap();
                this.tick();
//                console.info("Game loop started.");
            },

            tick: function () {
                if (this.started) {
                    this.emit('tick');
                    this.moveEntities();
                    this.scene.refreshFrame();
                }
                requestAnimFrame(this.tick.bind(this));
            },

            loadMap: function (data) {
                this.map = new Map(this);
                this.map.setData(data);
            },

            initMap: function () {
                var kind,
                    tile,
                    mId = 1,
                    id;

                for (var j, i = 0; i < this.map.height; i++) {
                    for (j = 0; j < this.map.width; j++) {
                        if ((kind = Types.getKindAsString(this.map.tiles[i][j])) !== undefined) {
                            id = 5000 + mId + String(i) + String(j);
                            tile = TileFactory.create(id, kind, i, j);
                            this.addToEntityGrid(tile);
                            this.addEntity(tile);
                            this.addToScene(tile);

                            mId++;
                        }
                    }
                }
            },

            addToScene: function(entity){
                var element = this.scene.createElement(entity);
                element.setSprite(this.spriteManager.getSprite(entity.kind));
                element.setAnimation('idle', 800);
                element.isAnimated = Types.getIsAnimateAsKind(entity.kind);

                this.scene.addToLayer(element,Types.getLayerAsKind(entity.kind));
            },

            removeFromScene: function(entity){
                this.scene.removeFromLayer(entity,Types.getLayerAsKind(entity.kind));
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

            moveEntities: function(){
                _.each(this.movableEntities, function(entity){
                    if(entity.isMovable){
                        if(entity instanceof Player){
                           if(this.isValidPlayerMove(entity)){
                                entity.move();
                            }
                        }else if(entity instanceof Bullet){
                            if(!this.map.isOutOfBounds.apply(this.map, entity.move(1, true))){
                                var hit = this.map.isBulletColliding.call(this.map, entity);
                                if(_.isObject(hit) && !_.isEmpty(hit)){
                                    _.each(hit, function(item){
                                       if(item.strength <= entity.damage)
                                            this.removeEntity(item);
                                    }, this);
                                }
                                else{
                                    entity.move();
                                    return;
                                }
                            }
                            entity.destroy();
                            this.removeEntity(entity);
                        }
                    }

                }, this);
            },

            removeEntity: function(entity){
                this.removeFromScene(entity);
                this.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
                delete this.entities[entity.id];

            },

            connect: function () {
                this.connection.connect();

                this.connection.on('connect',function () {
                    this.connection.send(Types.Messages.HELLO);
                }, this);

                this.connection.on('welcome',function (playerData) {
                    this.connected = true;
                    this.player = this.addPlayer(playerData);
                    this.emit('playerWelcome');
                }, this);

                this.connection.on('gameData',function (id, population, teamCount, minPlayers, maxPlayers, players) {
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

                this.connection.on('gameStart',function () {
                    this.started = true;
                    this.emit('start');
                }, this);

                this.connection.on('sendMap',function (data) {
                    this.loadMap(data);
                }, this);

                this.connection.on('joinGame',function (playerData) {
                    this.addPlayer(playerData);
                    this.incrementPopulation();
                }, this);

                this.connection.on('leftGame',function (playerId) {
                    this.decrementPopulation();
                    delete this.entities[playerId];

                    this.emit('playerLeft',playerId);
                }, this);

                this.connection.on('iReady',function (playerId) {
                    this.emit('playerReady',playerId);
                }, this);

                this.connection.on('gamePlay',function () {
//                    this.connection.send(Types.Messages.SENDMAP);
                    this.emit('play');
                }, this);

                this.connection.on('spawn',function (id, x, y, orientation) {
                    var player;
                    if (this.entityIdExists(id)) {
                        player = this.getEntityById(id);
                        player.setPosition(x, y);
                        player.setOrientation(orientation);
                        this.addToEntityGrid(player);

                        this.addToScene(player);

                        player.on('move',function(){
                            this.addToEntityGrid(player);
                        }, this);
                    }
                }, this);

                this.connection.on('chat',function(id, message){
                    this.emit('chatMessage',id, message);
                }, this);

                this.connection.on('move',function (id, orientation) {
                    this.playerMove(id, orientation);
                }, this);

                this.connection.on('endMove',function (id) {
                    this.playerStopMove(id);
                }, this);

                this.connection.on('syncPos',function (id ,x, y, gridX, gridY) {
                    this.entities[id].syncPososition(x, y, gridX, gridY);
                }, this);
            },

            addPlayer: function(d){
                var player = new Player(d[0],d[1],d[2],d[5],d[6]);
                player.setPosition(d[3],d[4]);
                this.addMovableEntity(player);
                this.emit('playerJoin',player);
                return player;
            },

            sendReady: function () {
                this.connection.send(Types.Messages.IREADY);
            },

            sendChatMessage: function (message) {
                this.connection.send(Types.Messages.CHAT);
            },

            playerFire: function(id){
                if(this.player.canFire()){
                this.player.toggleFire();
                var bullet = new Bullet(Date.now(), 'easy', 'bullet', this.player, 8);
                this.addMovableEntity(bullet);
                this.addToScene(bullet);
                bullet.toggleMovable();
                }
            },

            playerStopMove: function(id){
                var player = id ? this.entities[id] : this.player;

                if(player.isMovable){
                    player.toggleMovable();
                    if(!id){
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

                if(!player.isMovable){
                    player.toggleMovable();
                    if(!id){
                        this.connection.send(Types.Messages.MOVE, orientation);
                    }
                }
            },

            isColliding: function(entity){
                if(entity instanceof Player){
                    return this.isValidPlayerMove(entity);
                }else if(entity instanceof Bullet){
                    return this.isValidBulletMove(entity);
                }
                return false;
            },

            isValidPlayerMove: function (player) {
                if (this.map && player) {
                    var chunk = player.getChunk();

                    if (player.orientation === Types.Orientations.LEFT) {
                        return !this.map.isTankColliding.call(this.map, chunk[0][0] - 1, chunk[0][1], player.id) && !this.map.isTankColliding.call(this.map, chunk[2][0] - 1, chunk[2][1], player.id);
                    }
                    else if (player.orientation === Types.Orientations.UP) {
                        return !this.map.isTankColliding.call(this.map, chunk[0][0], chunk[0][1] - 1, player.id) && !this.map.isTankColliding.call(this.map, chunk[1][0], chunk[1][1] - 1, player.id);
                    }
                    else if (player.orientation === Types.Orientations.RIGHT) {
                        return !this.map.isTankColliding.call(this.map, chunk[1][0] + 1, chunk[1][1], player.id) && !this.map.isTankColliding.call(this.map, chunk[3][0] + 1, chunk[3][1], player.id);
                    }
                    else if (player.orientation === Types.Orientations.DOWN) {
                        return !this.map.isTankColliding.call(this.map, chunk[2][0], chunk[2][1] + 1, player.id) && !this.map.isTankColliding.call(this.map, chunk[3][0], chunk[3][1] + 1, player.id);
                    }
                }
                return false;
            },

            isValidBulletMove: function (player) {
                if (this.map && player) {
                    var chunk = player.getChunk();

                    if (player.orientation === Types.Orientations.LEFT) {
                        return !this.map.isBulletColliding.call(this.map, chunk[0][0] - 1, chunk[0][1], player.id) && !this.map.isBulletColliding.call(this.map, chunk[2][0] - 1, chunk[2][1], player.id);
                    }
                    else if (player.orientation === Types.Orientations.UP) {
                        return !this.map.isBulletColliding.call(this.map, chunk[0][0], chunk[0][1] - 1, player.id) && !this.map.isBulletColliding.call(this.map, chunk[1][0], chunk[1][1] - 1, player.id);
                    }
                    else if (player.orientation === Types.Orientations.RIGHT) {
                        return !this.map.isBulletColliding.call(this.map, chunk[1][0] + 1, chunk[1][1], player.id) && !this.map.isBulletColliding.call(this.map, chunk[3][0] + 1, chunk[3][1], player.id);
                    }
                    else if (player.orientation === Types.Orientations.DOWN) {
                        return !this.map.isBulletColliding.call(this.map, chunk[2][0], chunk[2][1] + 1, player.id) && !this.map.isBulletColliding.call(this.map, chunk[3][0], chunk[3][1] + 1, player.id);
                    }
                }
                return false;
            }
        });

        return Game;
    });
