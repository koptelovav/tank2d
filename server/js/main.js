define(['ws','utils','fs','gameserver','log', 'gametypes'],function(ws, Utils, fs, GameServer, Log) {
    function main(config) {
        var server = new ws.WebsocketServer(config.port),
            games = [],
            gameCount = 0;

        var GameServerID = function(){
            return parseInt(CONST.PREFIXES.GAMESERVER + '' +Utils.random(99) + '' + gameCount);
        };

        switch(config.debug_level) {
            case "error":
                log = new Log(Log.ERROR); break;
            case "debug":
                log = new Log(Log.DEBUG); break;
            case "info":
                log = new Log(Log.INFO); break;
        }

        log.info("Starting Tank2D game server...");

        var game = new GameServer(GameServerID(),config.game_name, server);
        game.run(config.map_filepath);
        games.push(game);
        gameCount++;

        server.on('connect',function(WebSocketIO) {
            WebSocketIO.room = game.id;
            WebSocketIO.join(game.id);
            game.emit('connect',WebSocketIO);
        });

        server.on('error',function() {
            log.error(Array.prototype.join.call(arguments, ", "));
        });

        server.on('requestGames',function(){
            return JSON.stringify(getGameDistribution(games));
        });

        process.on('uncaughtException', function (e) {
            log.error('uncaughtException: ' + e.stack);
        });
    }

    function getConfigFile(path, callback) {
        fs.readFile(path, 'utf8', function(err, json_string) {
            if(err) {
                console.error("Could not open config file:", err.path);
                callback(null);
            } else {
                callback(JSON.parse(json_string));
            }
        });
    }

    function getGameDistribution(games) {
        var distribution = [];

        _.each(games, function(game) {
            distribution.push(game.playerCount);
        });
        return distribution;
    }

    var defaultConfigPath = './server/config.json',
        customConfigPath = './server/config_local.json';

    process.argv.forEach(function (val, index, array) {
        if(index === 2) {
            customConfigPath = val;
        }
    });

    getConfigFile(defaultConfigPath, function(defaultConfig) {
        getConfigFile(customConfigPath, function(localConfig) {
            if(localConfig) {
                main(localConfig);
            } else if(defaultConfig) {
                main(defaultConfig);
            } else {
                console.error("Server cannot start without any configuration file.");
                process.exit(1);
            }
        });
    });
});