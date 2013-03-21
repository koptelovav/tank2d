Types = {
    Prefixes: {
        PLAYER: 1,
        GAMESERVER: 2,
        CONNECTION: 3
    },

    Messages: {
        HELLO: 0,
        WELCOME: 1,
        POPULATION: 2,
        JOINGAME: 3,
        LEFTGAME: 4,
        MOVE: 5
    },
    
    Entities: {
        TANK: 1,
        
        // Bonuses
        LIVE: 2,
        MEDAL: 3,
        BOMB: 4,
        WATCH: 5,
        SHOVEL: 6,
        HELMET: 7,
        BOAT: 8,
        PISTOL: 9,
        RANDOM: 10,

        // Objects
        FLAG: 30,

        // Static
        WALL: 40,
        ARMORWALL: 41,
        TREES: 42,
        ICE: 43,
        WATER: 44,
        PORTAL1: 45,
        PORTAL2: 46,
        BASE: 47
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

    wall: [Types.Entities.WALL, "static"],
    armorwall: [Types.Entities.ARMORWALL, "static"],
    trees: [Types.Entities.TREES, "static"],
    ice: [Types.Entities.ICE, "static"],
    water: [Types.Entities.WATER, "static"],
    portal1: [Types.Entities.PORTAL1, "static"],
    portal2: [Types.Entities.PORTAL2, "static"],
    base: [Types.Entities.BASE, "static"],


    getType: function(kind) {
        return kinds[Types.getKindAsString(kind)][1];
    }
};


Types.isPlayer = function(kind) {
    return kinds.getType(kind) === "player";
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
