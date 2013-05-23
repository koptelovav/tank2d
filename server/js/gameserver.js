define(['../../shared/js/gamebase', '../../shared/js/map', '../../shared/js/tilefactory', 'spawn','fs','listener', '../../shared/js/player'],
    function (GameBase, Map, TileFactory, Spawn, fs, Listener, Player) {

    var GameServer = GameBase.extend({
        init: function (id, name, websocketServer) {
            this.id = id;
            this.server = websocketServer;
            this.listener = new Listener();

            this.name = name;
            this.minPlayers = null;
            this.maxPlayers = null;
            this.teamCount = null;

            this.ups = 60;

            this.isStart = false;
            this.isPlay = false;

            this.spawns = {};
            this.players = {};
            this.entities = {};
            this.movableEntities = {};
            this.teams = {};
            this.entityGrid = [];

            this.outgoingQueues = {};

            this.population = 0;


            this.on('playerConnect', function (connection) {
                var player = new Player(connection.id, 'player', 'tank', this.getPlayerTeam(), false);
                this.addPlayer(player);

                this.listener.addConnection(connection);
                this.listener.assign(player, connection);
            }, this);

            this.listener.on('connect', function(player){
                this.pushToPlayer(player.id, Types.Messages.CONNECT);

                player.on('hello', function () {
                    log.info("Player has joined " + this.id);
                    this.incrementPopulation();

                    this.pushToPlayer(player.id, Types.Messages.WELCOME, player.getState());
                    this.pushToBroadcast(player.id, Types.Messages.JOINGAME, player.getState());
                    this.pushToPlayer(player.id,
                        Types.Messages.GAMEDATA,
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

                    this.pushToBroadcast(player.id, Types.Messages.LEFTGAME,  player.id);

                    this.removePlayer(player);
                    this.decrementPopulation();

                    this.listener.removeConnection(player.id);

                    if (this.population === 0) {
                        this.restart();
                    }
                }, this);

                player.on('ready', function () {
                    player.isReady = true;

                    this.pushToBroadcast(player.id, Types.Messages.IREADY,  player.id);

                    if (this._checkAllStarted() && this.population >= this.minPlayers && !this.isStart) {
                        this.isStart = true;
                        this.pushToAll(Types.Messages.GAMESTART, this.id);
                    }
                }, this);

                player.on('gameLoad', function () {
                    
                    player.isLoad = true;

                    if (this._checkAllLoaded() && !this.isPlay) {
                        this.isPlay = true;

                        this.pushToAll(Types.Messages.GAMEPLAY,  this.id);

                        this.spawnAll();
                    }
                }, this);

                player.on('playerBeginMove', function (orientation) {
                    

                    player.setOrientation(orientation);

                    if(!player.isMovable){
                        player.toggleMovable();
                        this.pushToBroadcast(player.id, Types.Messages.MOVE,  player.id,  player.orientation);
                    }
                }, this);

                player.on('playerEndMove', function () {
                }, this);

                player.on('beforeMove', function () {
                }, this);

                player.on('move', function () {
                }, this);

                player.on('chatMessage', function (message) {
                }, this);
            }, this);
        },

        run: function (filePath) {
            var data = fs.readFileSync(filePath, 'utf-8');

            this.map = new Map(this);

            this.map.on('init', function () {
                this.minPlayers = this.map.minPlayers;
                this.maxPlayers = this.map.maxPlayers;
                this.teamCount = this.map.teamCount;
                this.initEntityGrid();
                this.initMapTails();
                this.initTeams();
                this.initSpawns(this.map.spawns);
            }, this);

            this.map.setData(JSON.parse(data));

            var self = this;

            setInterval(function () {
                self.moveEntities();
                self.processQueues();
            }, 1000 / this.ups);
        },

        restart: function () {
            this.isStart = false;
            this.isPlay = false;
            this.population = 0;
            this.initEntityGrid();
            this.initMapTails();
        },

        initEntityGrid: function () {
            for (var j, i = 0; i < this.map.height; i++) {
                this.entityGrid[i] = [];
                for (j = 0; j < this.map.width; j++) {
                    this.entityGrid[i][j] = {};
                }
            }
        },

        initMapTails: function () {
            var id,
                kind,
                tail,
                mId = 1;
            for (var j, i = 0; i < this.map.height; i++) {
                for (j = 0; j < this.map.width; j++) {
                    if (this.map.tiles[i][j] !== 0 && (kind = Types.getKindAsString(this.map.tiles[i][j])) !== undefined) {
                        id = 5000 + mId + String(i) + String(j);
                        tail = TileFactory.create(id, kind, i, j);
                        this.entities[tail.id] = tail;
                        this.addToEntityGrid(tail);
                        mId++;
                    }
                }
            }
            if (this.isLoaded) {
                console.info("Collision grid generated.");
            }
        },

        moveEntities: function(){
            _.each(this.movableEntities, function(entity){
                if(entity.isMovable){
                    if (this.isValidPlayerMove(entity, entity.orientation)) {
                        this.unregisterEntityPosition(entity);
                        entity.move();
                    }
                }
            }, this);
        },

        _checkAllStarted: function () {
            var result = true;
            for (var player in this.players) {
                result = result && (this.players[player].isReady === true);
            }
            return result;
        },

        _checkAllLoaded: function () {
            var result = true;
            _.each(this.players, function (player) {
                if (player.isLoad !== true) {
                    console.log(player.id);
                }
                result = result && (player.isLoad === true);
            });

            return result;
        },

        initTeams: function () {
            for (var i = 0; i < this.teamCount; i++) {
                this.teams[i] = [];
            }
        },

        initSpawns: function (spawns) {
            var self = this,
                sId = 1;
            _.each(spawns, function (teamSpaws, teamId) {
                self.spawns[teamId] = [];
                _.each(teamSpaws, function (spawn) {

                    self.spawns[teamId].push(new Spawn(sId, teamId, spawn[0], spawn[1], spawn[2]));
                    sId++;
                });
            });
        },

        getRandomSpawn: function (team) {
            var teamSpawns = this.spawns[team];
            return teamSpawns[Math.floor(Math.random() * teamSpawns.length)];
        },

        spawnAll: function () {
            for (var id in this.players) {
                this.playerSpawn(id);
            }
        },

        playerSpawn: function (id) {
            var player = this.getEntityById(id);

            this.pushToAll(Types.Messages.SPAWN,
                player.id,
                player.gridX,
                player.gridY,
                player.orientation
            );
        },

        addPlayer: function (player) {
            var spawn;

            spawn = this.getRandomSpawn(player.team);
            player.setPosition(spawn.x, spawn.y);
            player.orientation = spawn.orientation;
            player.isPlay = true;

            this.teams[player.team].push(player.id);
            this.players[player.id] = player;
            this.outgoingQueues[player.id] = [];

            this.addToEntityGrid(player);
            this.addMovableEntity(player);
        },

        getPlayerTeam: function(){
            var selectedTeam = null,
                minTeamCount = 0;

            for (var id in this.teams) {
                if (_.isNull(selectedTeam) || minTeamCount > this.teams[id].length) {
                    selectedTeam = id;
                    minTeamCount = this.teams[id].length;
                }
            }
            return parseInt(selectedTeam);
        },

        getPlayersInfo: function (ignoreId) {
            var playersInfo = [];
            _.each(this.players, function (player) {
                if(player.id !== ignoreId)
                    playersInfo.push(player.getState());
            });
            return playersInfo;
        },

        removePlayer: function (player) {
            this.unregisterEntityPosition(player);
            delete this.players[player.id];
            delete this.entities[player.id];
            delete this.movableEntities[player.id];
            delete this.outgoingQueues[player.id];
            this.teams[player.team].splice(this.teams[player.team].indexOf(player.id), 1);
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

            return false;
        },

        isFull: function () {
            return this.population === this.maxPlayers;
        },

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
