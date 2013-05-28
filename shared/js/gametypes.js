Types = {
    Prefixes: {
        PLAYER: 1,
        GAMESERVER: 2,
        CONNECTION: 3,
        TAIL: 4
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
        LOADMAP : 10,
        GAMEPLAY: 11,
        SPAWN: 12,
        CHAT: 13,
        ENDMOVE: 14,
        CONNECT: 15,
        SENDMAP: 16
    },

    Entities: {
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
        FLAG: 160
    },

    MapElements: {
        WALL: 1,
        ARMOREDWALL: 2,
        TREES: 3,
        WATER: 4,
        ICE: 5,
        BASE: 6,
        PORTAL1: 7,
        PORTAL2: 8
    },
    
    Orientations: {
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4
    },

    Weapons: {

    },

    Armors: {

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

    getType: function(message) {
        return messages[Types.getMessageName(message)][1];
    }
};

Types.getMessageName = function(code) {
    for(var name in messages) {
        if(messages[name][0] === code) {
            return name;
        }
    }
};

Types.getMessageCode = function(name) {
    return messages[name][0];
};

var kindConfig = {
    ice: {
        layer: "background",
        animated: false,
        colliding: []
    },
    wall: {
        layer:"background",
        animated: false,
        colliding: ['tank','bullet']
    },
    armoredwall: {
        layer: "background",
        animated: false,
        colliding: ['tank','bullet']
    },
    trees: {
        layer: "foreground",
        animated: false,
        colliding: []
    },
    water: {
        layer: "background",
        animated: true,
        colliding: ['tank']
    },
    tank: {
        layer: "entities",
        animated: true,
        colliding: ['tank','bullet']

    },
    bullet: {
        layer: "entities",
        animated: false,
        colliding: ['tank','bullet']
    }
};

var kinds = {
    tank: [Types.Entities.TANK, "player"],


    live: [Types.Entities.LIVE, "bonus"],
    medal: [Types.Entities.MEDAL, "bonus"],
    bomb: [Types.Entities.BOMB, "bonus"],
    watch: [Types.Entities.WATCH, "bonus"],
    helmet: [Types.Entities.HELMET, "bonus"],
    boat: [Types.Entities.BOAT, "bonus"],
    pistol: [Types.Entities.PISTOL, "bonus"],

    flag: [Types.Entities.FLAG, "object"],

    wall: [Types.MapElements.WALL, "tile"],
    armoredwall: [Types.MapElements.ARMOREDWALL, "tile"],
    trees: [Types.MapElements.TREES, "tile"],
    ice: [Types.MapElements.ICE, "tile"],
    water: [Types.MapElements.WATER, "tile"],
    portal1: [Types.MapElements.PORTAL1, "tile"],
    portal2: [Types.MapElements.PORTAL2, "tile"],
    base: [Types.MapElements.BASE, "tile"],


    getType: function(kind) {
        return kinds[Types.getKindAsString(kind)][1];
    }
};

Types.getLayerAsKind = function(kind) {
    return kindConfig[kind]['layer'];
};
Types.getIsAnimateAsKind = function(kind) {
    return kindConfig[kind]['animated'];
};

Types.getCollidingArray = function(kind) {
    return kindConfig[kind]['colliding'];
};

Types.isPlayer = function(kind) {
    return kinds.getType(kind) === "player";
};

Types.isMapElement = function(kind) {
    return kinds.getType(kind) === "mapelement";
};

Types.isObject = function(kind) {
    return kinds.getType(kind) === "object";
};

Types.getKindFromString = function(kind) {
    if(kind in kinds) {
        return kinds[kind][0];
    }
};

Types.getKindAsString = function(kind) {
    for(var k in kinds) {
        if(kinds[k][0] === kind) {
            return k;
        }
    }
};

Types.forEachKind = function(callback) {
    for(var k in kinds) {
        callback(kinds[k][0], k);
    }
};


Types.getOrientationAsString = function(orientation) {
    switch(orientation) {
        case Types.Orientations.LEFT: return "left"; break;
        case Types.Orientations.RIGHT: return "right"; break;
        case Types.Orientations.UP: return "up"; break;
        case Types.Orientations.DOWN: return "down"; break;
    }
};

Types.getRandomItemKind = function(item) {
    var all = _.union(this.rankedWeapons, this.rankedArmors),
        forbidden = [Types.Entities.SWORD1, Types.Entities.CLOTHARMOR],
        itemKinds = _.difference(all, forbidden),
        i = Math.floor(Math.random() * _.size(itemKinds));
    
    return itemKinds[i];
};

Types.getMessageTypeAsString = function(type) {
    var typeName;
    _.each(Types.Messages, function(value, name) {
        if(value === type) {
            typeName = name;
        }
    });
    if(!typeName) {
        typeName = "UNKNOWN";
    }
    return typeName;
};

if(!(typeof exports === 'undefined')) {
    module.exports = Types;
}