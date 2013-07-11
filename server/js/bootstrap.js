GLOBAL._ = require("underscore");

var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    paths: {
        entity: '../../shared/js/entity',
        tile: '../../shared/js/tile',
        gametypes: '../../shared/js/gametypes',
        model: '../../shared/js/model',
        class: '../../shared/js/lib/class',
        events: '../../shared/js/lib/events',
        tilefactory: '../../shared/js/tilefactory',
        baseGame: '../../shared/js/baseGame',
        bullet: '../../shared/js/bullet',
        map: '../../shared/js/map',
        player: '../../shared/js/player',
        movableentity: '../../shared/js/movableentity',
        tank: '../../shared/js/tank',
    }
});

requirejs(['main','underscore'],function(){});