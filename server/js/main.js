
var fs = require('fs');


function main(config) {
    var ws = require("./ws"),
        Utils = require("./utils"),
        GameServer = require("./gameserver"),
        Log = require('log'),
        _ = require('underscore'),
        Player = require('./player'),
        server = new ws.WebsocketServer(config.port),
        games = [];
        gameCount = 0;

    var GameServerID = function(){
        return parseInt(Types.Prefixes.GAMESERVER + '' +Utils.random(99) + '' + gameCount);
    }

    switch(config.debug_level) {
        case "error":
            log = new Log(Log.ERROR); break;
        case "debug":
            log = new Log(Log.DEBUG); break;
        case "info":
            log = new Log(Log.INFO); break;
    };
    
    log.info("Starting Tank2D game server...");

    var game = new GameServer(GameServerID(),config.game_name, config.players_per_game, server);
    game.run(config.map_filepath);
    games.push(game);
    gameCount++;
    
    server.onConnect(function(connection) {
        game.connect_callback(new Player(connection, game));
    });

    server.onError(function() {
        log.error(Array.prototype.join.call(arguments, ", "));
    });


    process.on('uncaughtException', function (e) {
        log.error('uncaughtException: ' + e);
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