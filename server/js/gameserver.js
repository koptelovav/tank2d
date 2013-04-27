/*
*  Используемые модули
* */
var cls = require("./lib/class"),
    _ = require("underscore"),
    Message = require('./message'),
    Map = require('./map'),
    MapElementFactory = require('./mapelement'),
    Utils = require('./utils'),
    Spawn = require('./spawn'),
    Types = require("../../client/shared/js/gametypes");


/**
 * Класс игорового сервера
 */

module.exports = GameServer = cls.Class.extend({

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
        this.outgoingQueues = {};
        this.collidingGrid = [];

        this.playerCount = 0;

        this.onPlayerConnect(function(player) {
        });

        this.onPlayerEnter(function(player) {
            log.info("Player has joined "+ self.id);

            self.incrementPlayerCount();

//            self.pushBroadcast(new Message.Population(self.id, self.playerCount), player.id);
            self.pushBroadcast(new Message.JoinGame(player), player.id);
            self.pushToPlayer(player, new Message.gameData(self));

            player.onExit(function() {
                self.pushBroadcast(new Message.LeftGame(player), player.id);
                self.removePlayer(player);
                self.decrementPlayerCount();
                if(self.playerCount == 0){
                    self.restart();
                }
            });

            player.onReady(function() {
                if(self._checkAllStarted() && self.playerCount >= self.minPlayers && !self.isStart){
                    self.isStart = true;
                    self.pushBroadcast(new Message.gameStart(this.id),false);
                }
            });

            player.onBroadcast(function(message, ignoreSelf) {
                self.pushBroadcast(message, ignoreSelf ? player.id : null);
            });

            player.onSpawn(function(player){

            });

            player.onLoad(function(){
                console.log(self._checkAllLoaded(),!self.isPlay);
                if(self._checkAllLoaded() && !self.isPlay){
                    self.isPlay = true;
                    self.pushBroadcast(new Message.gamePlay(self.id), false);

                    setTimeout(function(){
                        self.spawnAll();
                    },100);

                    console.log('onLoad');
                }
            });
        });

        console.info('game '+ this.id +' init');
    },

    /**
     * Запуск игрового сервера (выполняется после инициализации)
     * @this {GameServer}
     * @param {string} mapFilePath ID игрового сервера
     */
    run: function(mapFilePath) {
        var self = this;

        this.map = new Map(this, mapFilePath);

        this.map.ready(function() {
            self.minPlayers = self.map.minPlayers;
            self.maxPlayers = self.map.maxPlayers;
            self.teamCount = self.map.teamCount;
            self.initCollidingGrid();
            self.initMapTails();
            self.initTeams();
            self.initSpawns(self.map.spawns);
        });

        setInterval(function() {
            self.processQueues();
        }, 1000 / this.ups);
    },

    restart: function(){
        console.log('restart');
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

    /**
     * Проверить все ли пользователи готовы начать игру
     * @returns {boolean}
     * @private
     */
    _checkAllStarted: function(){
        var result = true;
        for(var player in this.players) {
            result = result && (this.players[player].isReady === true);
        }
        return result;
    },

    /**
     * Проверить все ли пользователи загрузили карту
     * @returns {boolean}
     * @private
     */
    _checkAllLoaded: function(){
        var result = true;
        for(var player in this.players) {
            result = result && (this.players[player].isLoad === true);
        }
        return result;
    },

    /**
     * Обработка очереди.
     * Метод-рассыльщик сообщений пользователям
     * @this {GameServer}
     */
    processQueues: function() {
        var connection;

        for(var id in this.outgoingQueues) {
            if(this.outgoingQueues[id].length > 0) {
                console.log(this.outgoingQueues[id]);
                connection = this.server.getConnection(id);

                if(connection === undefined) console.log(id);

                connection.send(this.outgoingQueues[id]);
                this.outgoingQueues[id] = [];
            }
        }
    },

    /**
     * Функция-колбэк.
     * Вызыватеся при подключении пользователя к игровому серверу
     * @this {GameServer}
     * @param {function} callback
     */
    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    },

    /**
     * Функция-колбэк.
     * Вызывается после успешного подключения пользователя у игромому серверу
     * @this {GameServer}
     * @param {function} callback
     */
    onPlayerEnter: function(callback) {
        this.enter_callback = callback;
    },

    /**
     * Устанавливает новое значенеие игровков на игровом сервере
     * @this {GameServer}
     * @param {number} count новое количество игроков на игровом сервере
     */
    setPlayerCount: function(count) {
        this.playerCount = count;
    },

    /**
     * Увеличивает на 1 количество инроков на игровом сервере
     * @this {GameServer}
     */
    incrementPlayerCount: function() {
        this.setPlayerCount(this.playerCount + 1);
    },

    /**
     * Уменьшает на 1 количество инроков на игровом сервере
     * @this {GameServer}
     */
    decrementPlayerCount: function() {
        if(this.playerCount > 0) {
            this.setPlayerCount(this.playerCount - 1);
        }
    },

    /**
     * Игициализируем массивы комманд
     * @this {GameServer}
     */
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

        console.log(teamSpawns);

        return teamSpawns[Math.floor(Math.random()*teamSpawns.length)];
    },

    spawnAll: function(){
        for(var id in this.players){
            this.playerSpawn(id);
        }
    },

    playerSpawn: function(id){
        var spawn;

        spawn = this.getRandomSpawn(this.players[id].team);

        this.players[id].x = spawn.x;
        this.players[id].y = spawn.y;
        this.players[id].orientation = spawn.orientation;
        this.addToCollidingGrid(this.players[id]);

        this.pushBroadcast(new Message.spawn(this.players[id]), false);
    },

    /**
     * Отправить сообщение игроку
     * @this {GameServer}
     * @param {Player} player Пользователь-получатель сообщения
     * @param {Message} message Сообщение для отправки
     */
    pushToPlayer: function(player, message) {
        if(player && player.id in this.outgoingQueues) {
            this.outgoingQueues[player.id].push(message.serialize());
        } else {
            log.error("pushToPlayer: player was undefined");
        }
    },


    /**
     * Отправить сообщение нескольким игрокам, подключенных к данному игровому серверу.
     * Возможно исключить одного пользователя, как правило отправителя сообщения.
     * @this {GameServer}
     * @param {Message} message Сообщение для отправки
     * @param {number|boolean} ignoredPlayer ID исключаемого игрока
     */
    pushBroadcast: function(message, ignoredPlayer) {
        for(var id in this.outgoingQueues) {
            if(id != ignoredPlayer) {
                this.outgoingQueues[id].push(message.serialize());
            }
        }
    },

    /**
     * Добавить игрока в к игровому серверу.
     * Создает индекс в объекте очереди и сохранет игрока в массив игрков данного игрового сервера
     * @this {GameServer}
     * @param {Player} player Новый игрок
     */
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
        this.outgoingQueues[player.id] = [];
    },

    getPlayersInfo: function(){
        var playersInfo = [];
        _.each(this.players, function(player){
            playersInfo.push(player.getState());
        });
        return playersInfo;
    },

    /**
     * Удалить игрока с игорового сервера.
     * Удаляет индекс в объекте очереди и игрока из массива игрков данного игрового сервера
     * @this {GameServer}
     * @param {Player} player Игрок для удаления
     */

    removePlayer: function(player) {
        console.log('remove '+player.id);
        delete this.players[player.id];
        delete this.outgoingQueues[player.id];
        this.teams[player.team].splice(this.teams[player.team].indexOf(player.id),1);
    },

    /**
     * Метод ывполняет проверку возможности передвижения игрока в данном направлении
     * @param {Player} player Пользователь для которого выполняется проверка
     * @param {number} orientation Новое направление
     * @returns {boolean}
     */

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
    }

});
