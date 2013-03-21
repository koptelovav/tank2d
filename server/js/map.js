
var cls = require('./lib/class')
path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    Utils = require('./utils'),
    Checkpoint = require('./checkpoint');

module.exports = Map = cls.Class.extend({
    init: function(filepath) {
        var self = this;

        this.isLoaded = false;

        path.exists(filepath, function(exists) {
            if(!exists) {
                log.error(filepath + " doesn't exist.");
                return;
            }

            fs.readFile(filepath, function(err, file) {
                var json = JSON.parse(file.toString());

                self.initMap(json);
            });
        });
    },

    initMap: function(map) {
        this.width = map.width;
        this.height = map.height;
        this.collisions = map.collisions;
        this.isLoaded = true;

        if(this.ready_func) {
            this.ready_func();
        }
    },

    ready: function(ready_func) {
        this.ready_func = ready_func;
    },

    generateCollisionGrid: function() {
        this.grid = [];

        if(this.isLoaded) {

            log.info("Collision grid generated.");
        }
    },

    isOutOfBounds: function(x, y) {
        return x <= 0 || x >= this.width || y <= 0 || y >= this.height;
    },

    isColliding: function(x, y) {
        if(this.isOutOfBounds(x, y)) {
            return false;
        }
        return this.grid[y][x] === 1;
    }
});

var pos = function(x, y) {
    return { x: x, y: y };
};

var equalPositions = function(pos1, pos2) {
    return pos1.x === pos2.x && pos2.y === pos2.y;
};
