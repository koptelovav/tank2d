requirejs.config({
    enforceDefine: true,
    paths: {
        entity: 'entity',
        baseEntity: '../../shared/js/entity',
        tile: '../../shared/js/tile',
        gametypes: '../../shared/js/gametypes',
    }
});

define(['lib/underscore.min', 'util'], function() {
    require(["main"]);
});