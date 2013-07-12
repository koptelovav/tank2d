Types = {
    Environment: {
        CLIENT: 1,
        SERVER: 2
    },
    Layers: {
        ENTITIES: 1,
        BACKGROUND: 2,
        FOREGROUND: 3
    },
    Prefixes: {
        PLAYER: 1,
        GAMESERVER: 2,
        CONNECTION: 3,
        TAIL: 4,
        BASE: 5,
        EFFECT: 6
    },

    Messages: {
        HELLO: 0,
        WELCOME: 1,
        POPULATION: 2,
        JOINGAME: 3,
        LEFTGAME: 4,
        MOVE: 5,
        GAMESTART: 6,
        IREADY: 7,
        GAMEDATA: 8,
        GAMEFULL: 9,
        LOADMAP: 10,
        GAMEPLAY: 11,
        SPAWN: 12,
        CHAT: 13,
        ENDMOVE: 14,
        CONNECT: 15,
        SENDMAP: 16
    },

    Entities: {
        //Map elements
        WALL: 1,
        ARMOREDWALL: 2,
        TREES: 3,
        WATER: 4,
        ICE: 5,
        BASE: 6,

        ENTITY: 99,
        TANK: 100,
        BULLET: 101,

        // Bonuses
        LIVE: 102,
        MEDAL: 103,
        BOMB: 104,
        WATCH: 105,
        SHOVEL: 106,
        HELMET: 107,
        BOAT: 108,
        PISTOL: 109,
        RANDOM: 110,

        // Objects
        FLAG: 160,

        //effects
        BANG: 300,
        BIGBANG: 301
    },

    Collections: {
        ENTITY: 0,
        MOVABLE: 1,
        PLAYER: 2,
        BULLET: 3,
        TILE: 4
    },

    Orientations: {
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4
    },

    Impact: {
        DAMAGE: 1,
        FIRE: 2,
        ICE: 3,
        BANG: 4
    },

    Destroy: {
        VIEW: 1,
        COLLIDING: 2,
        FULL: 3
    },

    Effects: {
        BANG: 1,
        BIGBANG: 2
    }
};

var messages = {
    'hello': [Types.Messages.HELLO],
    'welcome': [Types.Messages.WELCOME],
    'population': [Types.Messages.POPULATION],
    'joinGame': [Types.Messages.JOINGAME],
    'leftGame': [Types.Messages.LEFTGAME],
    'move': [Types.Messages.MOVE],
    'gameStart': [Types.Messages.GAMESTART],
    'ready': [Types.Messages.IREADY],
    'gameData': [Types.Messages.GAMEDATA],
    'gameFull': [Types.Messages.GAMEFULL],
    'gamePlay': [Types.Messages.GAMEPLAY],
    'gameLoad': [Types.Messages.LOADMAP],
    'spawn': [Types.Messages.SPAWN],
    'chat': [Types.Messages.CHAT],
    'connect': [Types.Messages.CONNECT],
    'sendMap': [Types.Messages.SENDMAP],

    getType: function (message) {
        return messages[Types.getMessageName(message)][1];
    }
};

Types.getMessageName = function (code) {
    for (var name in messages) {
        if (messages[name][0] === code) {
            return name;
        }
    }
};

Types.getMessageCode = function (name) {
    return messages[name][0];
};

var kinds = {
    tank: [Types.Entities.TANK, "player"],
    bullet: [Types.Entities.BULLET, "bullet"],


    live: [Types.Entities.LIVE, "bonus"],
    medal: [Types.Entities.MEDAL, "bonus"],
    bomb: [Types.Entities.BOMB, "bonus"],
    watch: [Types.Entities.WATCH, "bonus"],
    helmet: [Types.Entities.HELMET, "bonus"],
    boat: [Types.Entities.BOAT, "bonus"],
    pistol: [Types.Entities.PISTOL, "bonus"],

    flag: [Types.Entities.FLAG, "object"],

    wall: [Types.Entities.WALL, "tile"],
    armoredwall: [Types.Entities.ARMOREDWALL, "tile"],
    trees: [Types.Entities.TREES, "tile"],
    ice: [Types.Entities.ICE, "tile"],
    water: [Types.Entities.WATER, "tile"],
    base: [Types.Entities.BASE, "tile"],

    bang: [Types.Entities.BANG, "effect"],
    bigbang: [Types.Entities.BIGBANG, "effect"],

    getType: function (kind) {
        return kinds[Types.getKindAsString(kind)][1];
    },
    getKindString: function (kind) {
        for (var name in kinds) {
            if (kinds[name][0] === kind)
                return name;
        }
    }
};

Types.getKindString = function (kind) {
    return kinds.getKindString(kind);
};


Types.getKindAsString = function (kind) {
    for (var k in kinds) {
        if (kinds[k][0] === kind) {
            return k;
        }
    }
};

if (!(typeof exports === 'undefined')) {
    module.exports = Types;
}