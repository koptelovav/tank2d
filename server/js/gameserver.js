define(['../../shared/js/model', 'utils', 'message', '../../shared/js/map', '../../shared/js/tilefactory', 'spawn','fs','../../shared/js/listener', '../../shared/js/player'],
    function (Model, Utils, Message, Map, TileFactory, Spawn, fs, Listener, Player) {

    var GameServer = Model.extend({

        /**
         * Конструктор класса (инициализация игрового сервера)
         * @this {GameServer}
         * @param {number} id ID игрового сервера
         * @param {string} name Название игорвого сервера (отображается пользователям)
         * @param {WebsocketServer} websocketServer Сокет-сервер
         */
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

            this.playerCount = 0;


            this.on('playerConnect', function (connection) {
                var player = new Player(connection.id, 'player', 'tank', this.getPlayerTeam(), false);
                this.addPlayer(player);
                this.listener.addConnection(connection);
            }, this);

            this.listener.on('connect', function(connectionId){
                this.sendToPlayer(connectionId, new Message.connect());
            }, this);


            this.listener.on('hello', function (playerId) {
                var player = this.players[playerId];

                log.info("Player has joined " + this.id);
                this.incrementPlayerCount();

                this.sendToPlayer(player.id, new Message.welcome(player));
                this.send(new Message.JoinGame(player));
                this.sendToPlayer(player.id, new Message.gameData(this));


                this.listener.once('close', function (playerId) {
                    console.log('exit: '+playerId);

                    var player = this.players[playerId];

                    this.broadcastFromPlayer(player.id, new Message.LeftGame(player));
                    this.removePlayer(player);
                    this.decrementPlayerCount();

                    this.listener.removeConnection(player.id);

                    if (this.playerCount === 0) {
                        this.restart();
                    }
                }, this);

                this.listener.on('ready', function (playerId) {
                    var player = this.players[playerId];
                    player.isReady = true;

                    this.broadcastFromPlayer(player.id, new Message.iReady(player));

                    if (this._checkAllStarted() && this.playerCount >= this.minPlayers && !this.isStart) {
                        this.isStart = true;
                        this.send(new Message.gameStart(this.id));
                    }
                }, this);

                this.listener.on('gameLoad', function (playerId) {
                    var player = this.players[playerId];
                    player.isLoad = true;

                    if (this._checkAllLoaded() && !this.isPlay) {
                        this.isPlay = true;

                        this.send(new Message.gamePlay(this.id));

                        this.spawnAll();
                    }
                }, this);

                this.listener.on('playerBeginMove', function (orientation) {
                    var player = this.players[playerId];

                    player.setOrientation(orientation);

                    if(!player.isMovable){
                        player.toggleMovable();
                        this.broadcastFromPlayer(player.id, new Message.Move(player));
                    }
                }, this);

                this.listener.on('playerEndMove', function () {
                    if(player.isMovable){
                        player.toggleMovable();
                        this.broadcastFromPlayer(player.id, new Message.EndMove(player));
                        this.send(new Message.SyncPosition(player));
                    }
                }, this);

                this.listener.on('beforeMove', function (player) {
                    this.unregisterEntityPosition(player);
                }, this);

                this.listener.on('chatMessage', function (message) {
                    this.send(new Message.chat(player.id, message));
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
            }, 1000 / this.ups);
        },

        restart: function () {
            this.isStart = false;
            this.isPlay = false;
            this.playerCount = 0;
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

        addEntity: function (entity) {
            this.entities[entity.id] = entity;
        },

        addMovableEntity: function (entity) {
            this.addEntity(entity);
            this.movableEntities[entity.id] = entity;
        },


        addToEntityGrid: function (entity) {
            var self = this;
            if (this.entities[entity.id]) {
                _.each(entity.getChunk(), function (pos) {
                    self.entityGrid[pos[0]][pos[1]][entity.id] = entity;
                });
            }
        },


        removeFromEntityGrid: function (entity, x, y) {
            delete this.entityGrid[x][y][entity.id];
        },

        unregisterEntityPosition: function(entity) {
            if(entity && entity.x && entity.y) {
                _.each(entity.getChunk(), function(pos){
                    this.removeFromEntityGrid(entity, pos[0], pos[1]);
                }, this);
            }
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

        setPlayerCount: function (count) {
            this.playerCount = count;
        },

        incrementPlayerCount: function () {
            this.setPlayerCount(this.playerCount + 1);
        },

        decrementPlayerCount: function () {
            if (this.playerCount > 0) {
                this.setPlayerCount(this.playerCount - 1);
            }
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
            var spawn,
                player = this.getPlayerById(id);

            spawn = this.getRandomSpawn(player.team);

            player.setPosition(spawn.x, spawn.y);
            player.orientation = spawn.orientation;
            player.isPlay = true;

            this.addToEntityGrid(player);

            this.send(new Message.spawn(player));
        },

        getPlayerById: function (id) {
            return this.players[id];
        },

        addPlayer: function (player) {
            this.teams[player.team].push(player.id);
            this.players[player.id] = player;
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

        getPlayersInfo: function () {
            var playersInfo = [];
            _.each(this.players, function (player) {
                playersInfo.push(player.getState());
            });
            return playersInfo;
        },

        removePlayer: function (player) {
            this.unregisterEntityPosition(player);
            delete this.players[player.id];
            delete this.entities[player.id];
            delete this.movableEntities[player.id];
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
            return this.playerCount === this.maxPlayers;
        },

        send: function (message) {
            this.server.sendToRoom(this.id, message.serialize());
        },

        sendToPlayer: function (playerId, message) {
            var connection = this.server.getConnection(playerId);
            connection.send(message.serialize());
        },

        broadcastFromPlayer: function (playerId, message) {
            var connection = this.server.getConnection(playerId);
            connection.broadcast(message.serialize());
        }
    });
    return GameServer;
});
