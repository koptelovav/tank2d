/*
*  Используемые модули
* */
var Model = require("./model"),
    Message = require('./message'),
    Map = require('./map'),
    MapElementFactory = require('./mapelement'),
    Utils = require('./utils'),
    Spawn = require('./spawn'),
    Types = require("../../shared/js/gametypes");


/**
 * Класс игорового сервера
 */

module.exports = GameServer = Model.extend({

    /**
     * Конструктор класса (инициализация игрового сервера)
     * @this {GameServer}
     * @param {number} id ID игрового сервера
     * @param {string} name Название игорвого сервера (отображается пользователям)
     * @param {WebsocketServer} websocketServer Сокет-сервер
     */
    init: function(id, name, websocketServer) {
        var self = this;

        this.id = id;
        this.name = name;
        this.minPlayers = null;
        this.maxPlayers = null;
        this.teamCount = null;
        this.server = websocketServer;
        this.ups = 50;

        this.isStart = false;
        this.isPlay = false;

        this.spawns = {};
        this.players = {};
        this.entities = {};
        this.teams = {};
        this.collidingGrid = [];

        this.playerCount = 0;

        this.on('playerConnect',function(player){

        });

        this.on('playerEnter',function(player) {
            log.info("Player has joined "+ self.id);

            self.incrementPlayerCount();
            player.broadcast(new Message.JoinGame(player));
            player.send(new Message.gameData(self));

            player.on('exit',function() {
                player.broadcast(new Message.LeftGame(player));
                self.removePlayer(player);
                self.decrementPlayerCount();
                if(self.playerCount == 0){
                    self.restart();
                }
            });

            player.on('ready',function(){
                if(self._checkAllStarted() && self.playerCount >= self.minPlayers && !self.isStart){
                    self.isStart = true;
                    self.send(new Message.gameStart(self.id));
                }
            });

            player.on('load',function(){
                if(self._checkAllLoaded() && !self.isPlay){
                    self.isPlay = true;
                    self.send(new Message.gamePlay(self.id));

                    setTimeout(function(){
                        self.spawnAll();
                    },100);
                }
            });

            player.on('beforeMove',function(player){
                self.removeFromCollidingGrid(player);
            });
        });
    },

    run: function(mapFilePath) {
        var self = this;

        this.map = new Map(this, mapFilePath);

        this.map.on('init',function() {
            self.minPlayers = self.map.minPlayers;
            self.maxPlayers = self.map.maxPlayers;
            self.teamCount = self.map.teamCount;
            self.initCollidingGrid();
            self.initMapTails();
            self.initTeams();
            self.initSpawns(self.map.spawns);
        });

        setInterval(function() {
            //game loop
        }, 1000 / this.ups);
    },

    restart: function(){
        this.isStart = false;
        this.isPlay = false;
        this.initCollidingGrid();
        this.initMapTails();
    },

    initCollidingGrid: function(){
        for (var j, i = 0; i < this.map.height; i++) {
            this.collidingGrid[i] = [];
            for (j = 0; j < this.map.width; j++) {
                    this.collidingGrid[i][j] = {};
                }
            }
    },

    initMapTails: function(){
        var id,
            kind,
            tail,
            mId = 1;
        for (var j, i = 0; i < this.map.height; i++) {
            for (j = 0; j < this.map.width; j++) {
                if (this.map.bitmap[i][j] !==0 && (kind = Types.getKindAsString(this.map.bitmap[i][j])) !== undefined) {
                    id = 5000 + mId + String(i) + String(j);
                    tail = MapElementFactory.create(id, kind, i, j);
                    this.entities[tail.id] = tail;
                    this.addToCollidingGrid(tail);
                    mId++;
                }
            }
        }
        if (this.isLoaded) {
            console.info("Collision grid generated.");
        }
    },

    addEntity: function(entity){
        this.entities[entity.id] = entity;
    },

    addToCollidingGrid: function(entity){
        var self = this;
        if(this.entities[entity.id]){
            _.each(entity.getChunk(), function(pos){
                self.collidingGrid[pos[0]][pos[1]][entity.id] = entity;
            });
        }
    },

    removeFromCollidingGrid: function(entity){
        var self = this;
        if(this.entities[entity.id]){
            _.each(entity.getChunk(), function(pos){
                delete self.collidingGrid[pos[0]][pos[1]][entity.id];
            });
        }
    },

    _checkAllStarted: function(){
        var result = true;
        for(var player in this.players) {
            result = result && (this.players[player].isReady === true);
        }
        return result;
    },

    _checkAllLoaded: function(){
        var result = true;
        _.each(this.players,function(player){
            if(player.isLoad !== true){
                console.log(player.id);
            }
            result = result && (player.isLoad === true);
        });

        return result;
    },

    setPlayerCount: function(count) {
        this.playerCount = count;
    },

    incrementPlayerCount: function() {
        this.setPlayerCount(this.playerCount + 1);
    },

    decrementPlayerCount: function() {
        if(this.playerCount > 0) {
            this.setPlayerCount(this.playerCount - 1);
        }
    },

    initTeams: function(){
        for(var i=0; i < this.teamCount; i++){
              this.teams[i] = [];
        }
    },

    initSpawns: function(spawns){
        var self = this,
            sId = 1;
        _.each(spawns, function(teamSpaws, teamId){
            self.spawns[teamId] = [];
            _.each(teamSpaws, function(spawn){

                self.spawns[teamId].push(new Spawn(sId, teamId, spawn[0], spawn[1], spawn[2]));
                sId++;
            });
        });
    },

    getRandomSpawn: function(team){
        var teamSpawns = this.spawns[team];
        return teamSpawns[Math.floor(Math.random()*teamSpawns.length)];
    },

    spawnAll: function(){
        for(var id in this.players){
            this.playerSpawn(id);
        }
    },

    playerSpawn: function(id){
        var spawn,
            player = this.getPlayerById(id);

        spawn = this.getRandomSpawn(player.team);

        player.x = spawn.x;
        player.y = spawn.y;
        player.orientation = spawn.orientation;

        this.addToCollidingGrid(player);

        this.send(new Message.spawn(player));
    },

    getPlayerById: function(id){
        return this.players[id];
    },

    addPlayer: function(player) {
        var selectedTeam = null,
            minTeamCount = 0;

        for(var id in this.teams) {
            if(_.isNull(selectedTeam) || minTeamCount > this.teams[id].length){
                selectedTeam = id;
                minTeamCount = this.teams[id].length;
            }
        }

        player.team = parseInt(selectedTeam);
        this.teams[player.team].push(player.id);
        this.players[player.id] = player;
        this.entities[player.id] = player;
    },

    getPlayersInfo: function(){
        var playersInfo = [];
        _.each(this.players, function(player){
            playersInfo.push(player.getState());
        });
        return playersInfo;
    },

    removePlayer: function(player) {
        delete this.players[player.id];
        this.teams[player.team].splice(this.teams[player.team].indexOf(player.id),1);
        this.removeFromCollidingGrid(player);
    },

    isValidPlayerMove: function(player, orientation){
        if(this.map && player) {
            var chunk = player.getChunk();
            if(orientation === Types.Orientations.LEFT){
                return !this.map.isTankColliding.call(this.map,chunk[0][0]-1,chunk[0][1]) && !this.map.isTankColliding.call(this.map,chunk[2][0]-1,chunk[2][1]);
            }
            else if(orientation === Types.Orientations.UP){
                return !this.map.isTankColliding.call(this.map,chunk[0][0],chunk[0][1]-1) && !this.map.isTankColliding.call(this.map,chunk[1][0],chunk[1][1]-1);
            }
            else if(orientation === Types.Orientations.RIGHT){
                return !this.map.isTankColliding.call(this.map,chunk[1][0]+1,chunk[1][1]) && !this.map.isTankColliding.call(this.map,chunk[3][0]+1,chunk[3][1]);
            }
            else if(orientation === Types.Orientations.DOWN){
                return !this.map.isTankColliding.call(this.map,chunk[2][0],chunk[2][1]+1) && !this.map.isTankColliding.call(this.map,chunk[3][0],chunk[3][1]+1);
            }
        }
    },

    isFull: function(){
        return this.playerCount === this.maxPlayers;
    },

    send: function(message){
        this.server.sendToRoom(this.id,message.serialize());
    }

});
