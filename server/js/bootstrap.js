GLOBAL._ = require("underscore");

var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    paths: {
        entity: '../../shared/js/entity',
        tile: '../../shared/js/tile',
        gametypes: '../../shared/js/gametypes'
    }
});

requirejs(['main','underscore'],function(){});