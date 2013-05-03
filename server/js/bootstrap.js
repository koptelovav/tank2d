GLOBAL._ = require("underscore");

var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require
});

requirejs(['main','underscore'],function(){});