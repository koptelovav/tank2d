GLOBAL._ = require("underscore");

var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    paths: {
        entity: ['../../shared/js/entity']
    }
});

requirejs(['main','underscore'],function(){});