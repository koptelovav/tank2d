define(['../../shared/js/baseGame', '../../shared/js/map', 'tilefactory','fs','listener', '../../shared/js/player'],
    function (GameBase, Map, TileFactory, fs, Listener, Player) {

    var GameServer = GameBase.extend({
        init: function (id, name, websocketServer) {
            this.id = id;
            this.env = CONST.ENVIRONMENT.SERVER;
            this.server = websocketServer;
            this.listener = new Listener();

            this.name = name;
            this.minPlayers = null;
            this.maxPlayers = null;
            this.teamCount = null;

            this.ups = 60;

            this.isStart = false;
            this.isPlay = false;

            this.collections = {};
            this.teams = {};

            this.entityGrid = [];
            this.outgoingQueues = {};
            this.population = 0;



            this.on('connect', function (connection) {
                var player = new Player(connection.id, CONST.ENTITIES.PLAYER, CONST.ENTITIES.TANK, this.getFreeTeamNumber(), false);
                this.addPlayer(player);

                this.listener.addConnection(connection);
                this.listener.assign(player, connection);
            }, this);

            this.listener.on('assigned', function(player){
                this.pushToPlayer(player.id, CONST.MESSAGES.CONNECT);

                player.on('hello', function () {
                    log.info("Player has joined " + this.id);
                    this.incrementPopulation();

                    this.pushToPlayer(player.id, CONST.MESSAGES.WELCOME, player.getState());
                    this.pushToBroadcast(player.id, CONST.MESSAGES.JOINGAME, player.getState());
                    this.pushToPlayer(player.id,
                        CONST.MESSAGES.GAMEDATA,
                        this.id,
                        this.population,
                        this.teamCount,
                        this.minPlayers,
                        this.maxPlayers,
                        this.getPlayersInfo(player.id)
                    );
                }, this);

                player.on('exit', function () {
                    console.log('exit: '+player.id);

                    this.pushToBroadcast(player.id, CONST.MESSAGES.LEFTGAME,  player.id);

                    this.removePlayer(player);
                    this.decrementPopulation();

                    this.listener.removeConnection(player.id);

                    if (this.population === 0) {
                        this.restart();
                    }
                }, this);

                player.on('ready', function () {
                    player.isReady = true;

                    this.pushToBroadcast(player.id, CONST.MESSAGES.IREADY,  player.id);

                    if (this._checkAllStarted() && this.population >= this.minPlayers && !this.isStart) {
                        this.isStart = true;
                        this.pushToAll(CONST.MESSAGES.GAMESTART, this.gameTick);
                        this.pushToAll(CONST.MESSAGES.SENDMAP, this.map.getData());
                    }
                }, this);

                player.on('gameLoad', function () {

                    player.isLoad = true;

                    if (this._checkAllLoaded() && !this.isPlay) {
                        this.isPlay = true;

                        this.pushToAll(CONST.MESSAGES.GAMEPLAY,  this.id);

                        this.spawnAll();
                    }
                }, this);

                player.on('playerBeginMove', function (orientation) {
                    player.setOrientation(orientation);

                    if(!player.isMovable){
                        player.toggleMovable();
                        this.pushToBroadcast(player.id, CONST.MESSAGES.MOVE,  player.id,  player.orientation);
                    }
                }, this);

                player.on('endMove', function () {
                    if(player.isMovable){
                        player.toggleMovable();
                        this.pushToAll(CONST.MESSAGES.ENDMOVE,  player.id);
                    }
                }, this);

                player.on('beforeMove', function () {
                }, this);

                player.on('move', function (orientation) {
                    player.setOrientation(orientation);

                    if(!player.isMovable){
                        player.toggleMovable();
                        this.pushToAll(CONST.MESSAGES.MOVE,  player.id,  player.orientation);
                    }
                }, this);

                player.on('fire', function () {
                    this.pushToAll(CONST.MESSAGES.FIRE,  player.id);
                }, this);

                player.on('chatMessage', function (message) {
                }, this);
            }, this);
        },

        initLoop: function(){
            var self = this;

            this.intervalFramerate = 1000 / this.ups;
            this.oldTime = Date.now();
            this.gameTick = 0;
            var gameLoop = function () {
                var now = Date.now();
                if (self.oldTime + self.intervalFramerate <= now) {
                    self.speedFactor = (now - self.oldTime) / 1000.0;
                    self.oldTime = now;
                    self.tick();
                    self.gameTick++;
                    if(self.gameTick % 180 == 0)
                        console.log([self.oldTime,self.gameTick, self.speedFactor]);
                    // console.log('speedFactor', self.speedFactor, '(target: ' + self.intervalFramerate +' ms)', 'node ticks', self.gameTick);
                }
                if (Date.now() - self.oldTime < self.intervalFramerate - 16) {
                    setTimeout(gameLoop);
                } else {
                    setImmediate(gameLoop);
                }
            };
            gameLoop();
        },

        run: function (filePath) {
            var data = fs.readFileSync(filePath, 'utf-8');

            this.map = new Map(this);

            this.map.on('init', function () {
                this.minPlayers = this.map.minPlayers;
                this.maxPlayers = this.map.maxPlayers;
                this.teamCount = this.map.teamCount;

                this.initEntityGrid();
                this.initMap();
            }, this);

            this.map.setData(JSON.parse(data));
            this.initLoop();
        },

        tick: function(){
            this.moveEntities();
            this.processQueues();
        },

        restart: function () {
            this.isStart = false;
            this.isPlay = false;
            this.population = 0;
            this.collections = {};
            this.initEntityGrid();
            this.initMap();
        },

        _checkAllStarted: function () {
            var result = true;
            for (var id in this.collections[CONST.COLLECTIONS.PLAYER]) {
                result = result && (this.collections[CONST.COLLECTIONS.PLAYER][id].isReady === true);
            }
            return result;
        },

        _checkAllLoaded: function () {
            var result = true;
            _.each(this.collections[CONST.COLLECTIONS.PLAYER], function (player) {
                if (player.isLoad !== true) {
                    console.log(player.id);
                }
                result = result && (player.isLoad === true);
            });

            return result;
        },

        moveEntities: function(){
            _.each(this.collections[CONST.COLLECTIONS.ENTITY], function(entity){
                if(entity.isMovable){

                }
            }, this);
        },

        getFreeTeamNumber: function(){
            var selectedTeam = null,
                minTeamCount = 0;

            for (var number in this.teams) {
                if (_.isNull(selectedTeam) || minTeamCount > this.teams[number].players.length) {
                    selectedTeam = number;
                    minTeamCount = this.teams[number].players.length;
                }
            }
            return parseInt(selectedTeam);
        },

        getRandomSpawn: function (teamNumber) {
            var teamSpawns = this.teams[teamNumber].spawns;
            return teamSpawns[Math.floor(Math.random() * teamSpawns.length)];
        },

        playerSpawn: function (id) {
            var player = this.getEntityById(id);

            this.pushToAll(CONST.MESSAGES.SPAWN,
                player.id,
                player.gridX,
                player.gridY,
                player.orientation
            );
        },

        spawnAll: function () {
            for (var id in this.collections[CONST.COLLECTIONS.PLAYER]) {
                this.playerSpawn(id);
            }
        },

        addPlayer: function (player) {
            var spawn = this.getRandomSpawn(player.team);

            player.setPosition(spawn.x, spawn.y);
            player.orientation = spawn.orientation;
            player.isPlay = true;

            this.outgoingQueues[player.id] = [];

            this.addEntity(player, true);
        },

        removePlayer: function (player) {
            this.removeEntity(player);
            delete this.outgoingQueues[player.id];
        },

        getPlayersInfo: function (ignoreId) {
            var playersInfo = [];
            _.each(this.collections[CONST.COLLECTIONS.PLAYER], function (player) {
                if(player.id !== ignoreId)
                    playersInfo.push(player.getState());
            });
            return playersInfo;
        },

        isFull: function () {
            return this.population === this.maxPlayers;
        },

        /* Send messages */

        pushToPlayer: function(playerId){
            var args = _.toArray(arguments).slice(1);

            if(playerId in this.outgoingQueues) {
                this.outgoingQueues[playerId].push(args);
            } else {
                log.error("pushToPlayer: player was undefined");
            }
        },

        pushToBroadcast: function(ignoredId){
            var args = _.toArray(arguments).slice(1);

            for(var id in this.outgoingQueues) {
                if(id != ignoredId) {
                    this.outgoingQueues[id].push(args);
                }
            }
        },

        pushToAll: function(){
            var args = _.toArray(arguments);

            for(var id in this.outgoingQueues) {
                this.outgoingQueues[id].push(args);
            }
        },

        processQueues: function() {
            var connection;

            for(var id in this.outgoingQueues) {
                if(this.outgoingQueues[id].length > 0) {
                    connection = this.server.getConnection(id);
                    connection.send(this.outgoingQueues[id]);
                    this.outgoingQueues[id] = [];
                }
            }
        }
    });
    return GameServer;
});
