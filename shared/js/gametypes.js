Types = {
    Environment:{
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
        BASE: 5
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
        FLAG: 160
    },

    Collections: {
        ENTITY: 0,
        MOVABLE: 1,
        PLAYER: 2,
        BULLET: 3,
        TILE : 4
    },

    Orientations: {
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4
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
    base: {
        layer: Types.Layers.BACKGROUND,
        animated: false,
        strength: 0,
        width: 32,
        height: 32,
        colliding: [Types.Entities.TANK,Types.Entities.BULLET]
    },
    ice: {
        layer: Types.Layers.BACKGROUND,
        animated: false,
        strength: 0,
        width: 16,
        height: 16,
        colliding: []
    },
    wall: {
        layer: Types.Layers.BACKGROUND,
        animated: false,
        strength: 30,
        width: 16,
        height: 16,
        colliding: [Types.Entities.TANK,Types.Entities.BULLET]
    },
    armoredwall: {
        layer: Types.Layers.BACKGROUND,
        animated: false,
        strength: 60,
        width: 16,
        height: 16,
        colliding: [Types.Entities.TANK,Types.Entities.BULLET]
    },
    trees: {
        layer: Types.Layers.FOREGROUND,
        animated: false,
        strength: 0,
        width: 16,
        height: 16,
        colliding: []
    },
    water: {
        layer: Types.Layers.BACKGROUND,
        animated: true,
        strength: 0,
        width: 16,
        height: 16,
        colliding: [Types.Entities.TANK]
    },
    tank: {
        layer: Types.Layers.ENTITIES,
        animated: true,
        strength: 1,
        colliding: ['tank','bullet','wall','armoredwall','water']

    },
    bullet: {
        layer: Types.Layers.ENTITIES,
        animated: false,
        strength: 1,
        colliding: ['tank','bullet','wall','armoredwall']
    }
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

    getType: function(kind) {
        return kinds[Types.getKindAsString(kind)][1];
    },
    getKindString: function(kind) {
        for(var name in kinds){
            if(kinds[name][0] === kind)
                return name;
        }
    }
};

Types.getKindLayer = function(kind) {
    return kindConfig[kinds.getKindString(kind)]['layer'];
};
Types.getIsAnimateAsKind = function(kind) {
    return kindConfig[kinds.getKindString(kind)]['animated'];
};

Types.getCollidingArray = function(kind) {
    return kindConfig[kinds.getKindString(kind)]['colliding'];
};

Types.getKindConfig = function(kind, param) {
   // console.log(kinds.getKindString(kind),kind);
    if(param) return kindConfig[kinds.getKindString(kind)][param];
    else return kindConfig[kinds.getKindString(kind)];

};

Types.getKindString = function(kind) {
    return kinds.getKindString(kind);
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