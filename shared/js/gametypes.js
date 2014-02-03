CONST = {

    ENVIRONMENT: {
        CLIENT: 1,
        SERVER: 2
    },
    LAYERS: {
        ENTITIES: 1,
        BACKGROUND: 2,
        FOREGROUND: 3,
        EFFECTS: 4
    },
    PREFIXES: {
        PLAYER: 1,
        GAMESERVER: 2,
        CONNECTION: 3,
        TAIL: 4,
        BASE: 5,
        EFFECT: 6
    },

    MESSAGES: {
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
        SENDMAP: 16,
        FIRE: 17
    },

    ENTITIES: {
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

    TYPES: {
        PLAYER: 1,
        TILE: 2,
        EFFECT: 3,
        BULLET: 4
    },

    COLLECTIONS: {
        ENTITY: 0,
        MOVABLE: 1,
        PLAYER: 2,
        BULLET: 3,
        TILE: 4
    },

    ORIENTATIONS: {
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4
    },

    IMPACT: {
        DAMAGE: 1,
        FIRE: 2,
        ICE: 3,
        BANG: 4
    },

    DESTROY: {
        VIEW: 1,
        COLLIDING: 2,
        FULL: 3
    },

    EFFECTS: {
        BANG: 1,
        BIGBANG: 2
    },

    ACTIONS: {
        DESTROY: 1
    }
};

var messages = {
    'hello': [CONST.MESSAGES.HELLO],
    'welcome': [CONST.MESSAGES.WELCOME],
    'population': [CONST.MESSAGES.POPULATION],
    'joinGame': [CONST.MESSAGES.JOINGAME],
    'leftGame': [CONST.MESSAGES.LEFTGAME],
    'move': [CONST.MESSAGES.MOVE],
    'endMove': [CONST.MESSAGES.ENDMOVE],
    'gameStart': [CONST.MESSAGES.GAMESTART],
    'ready': [CONST.MESSAGES.IREADY],
    'gameData': [CONST.MESSAGES.GAMEDATA],
    'gameFull': [CONST.MESSAGES.GAMEFULL],
    'gamePlay': [CONST.MESSAGES.GAMEPLAY],
    'gameLoad': [CONST.MESSAGES.LOADMAP],
    'spawn': [CONST.MESSAGES.SPAWN],
    'chat': [CONST.MESSAGES.CHAT],
    'connect': [CONST.MESSAGES.CONNECT],
    'sendMap': [CONST.MESSAGES.SENDMAP],
    'fire': [CONST.MESSAGES.FIRE],

    getType: function (message) {
        return messages[CONST.getMessageName(message)][1];
    }
};

CONST.getMessageName = function (code) {
    for (var name in messages) {
        if (messages[name][0] === code) {
            return name;
        }
    }
};

CONST.getMessageCode = function (name) {
    return messages[name][0];
};

var kinds = {
    tank: [CONST.ENTITIES.TANK, "player"],
    bullet: [CONST.ENTITIES.BULLET, "bullet"],


    live: [CONST.ENTITIES.LIVE, "bonus"],
    medal: [CONST.ENTITIES.MEDAL, "bonus"],
    bomb: [CONST.ENTITIES.BOMB, "bonus"],
    watch: [CONST.ENTITIES.WATCH, "bonus"],
    helmet: [CONST.ENTITIES.HELMET, "bonus"],
    boat: [CONST.ENTITIES.BOAT, "bonus"],
    pistol: [CONST.ENTITIES.PISTOL, "bonus"],

    flag: [CONST.ENTITIES.FLAG, "object"],

    wall: [CONST.ENTITIES.WALL, "tile"],
    armoredwall: [CONST.ENTITIES.ARMOREDWALL, "tile"],
    trees: [CONST.ENTITIES.TREES, "tile"],
    ice: [CONST.ENTITIES.ICE, "tile"],
    water: [CONST.ENTITIES.WATER, "tile"],
    base: [CONST.ENTITIES.BASE, "tile"],

    bang: [CONST.ENTITIES.BANG, "effect"],
    bigbang: [CONST.ENTITIES.BIGBANG, "effect"],

    getType: function (kind) {
        return kinds[CONST.getKindAsString(kind)][1];
    },
    getKindString: function (kind) {
        for (var name in kinds) {
            if (kinds[name][0] === kind)
                return name;
        }
    }
};

CONST.getKindString = function (kind) {
    return kinds.getKindString(kind);
};


CONST.getKindAsString = function (kind) {
    for (var k in kinds) {
        if (kinds[k][0] === kind) {
            return k;
        }
    }
};

CONST.getOrientationString = function(orientation) {
    switch(orientation) {
        case CONST.ORIENTATIONS.LEFT: return "left"; break;
        case CONST.ORIENTATIONS.RIGHT: return "right"; break;
        case CONST.ORIENTATIONS.UP: return "up"; break;
        case CONST.ORIENTATIONS.DOWN: return "down"; break;
    }
};

if (!(typeof exports === 'undefined')) {
    module.exports = CONST;
}