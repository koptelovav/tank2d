requirejs.config({
    enforceDefine: true,
    paths: {
        entity: 'entity',
        baseEntity: '../../shared/js/entity',
        tile: '../../shared/js/tile',
        gametypes: '../../shared/js/gametypes',
        model: '../../shared/js/model',
        class: '../../shared/js/lib/class',
        events: '../../shared/js/lib/events',
        tilefactory: '../../shared/js/tilefactory',
        baseGame: '../../shared/js/baseGame',
        tank: '../../shared/js/tank',
        bullet: '../../shared/js/bullet',
        map: '../../shared/js/map',
        player: '../../shared/js/player',
        movableentity: '../../shared/js/movableentity',
        effectFactory: 'effectFactory2',
        scene: 'scene'
    }
});

define(['scene','tank','gametypes','effectFactory','lib/underscore.min', 'util'], function() {
    require(["main"]);
});