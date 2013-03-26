
var cls = require('./lib/class')
path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    MapElementFactory = require('./mapelement'),
    Types = require('../../shared/js/gametypes'),
    Utils = require('./utils');

module.exports = Map = cls.Class.extend({
    init: function(filepath) {
        var self = this;

        this.dinamicGrid = [];
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
        var self = this;
        this.tails = [];

// Поварачиваем карту для "парильного доступа к координатам"
        for(var j, i = 0; i < map.tails.length; i++){
            for(j = 0; j < map.tails[0].length; j++){
                if(self.tails[j] === undefined)  self.tails[j] = [];
                self.tails[j][map.tails.length-i-1] = map.tails[i][j];
            }
        }

        this.width = self.tails.length;
        this.height = self.tails[0].length;
// -------------------------


        this.isLoaded = true;

        if(this.ready_func) {
            this.ready_func();
        }
    },

    ready: function(ready_func) {
        this.ready_func = ready_func;
    },

    generateCollisionGrids: function() {
        var self = this,
            kind;
// Заполняем карту объектами
        for(var j, i = 0; i < self.height; i++) {
            for(j = 0; j < self.width; j++) {
                if((kind = Types.getKindAsString(self.tails[i][j])) !== undefined){
                    self.tails[i][j] = MapElementFactory.create(kind);
                }else{
                    self.tails[i][j] = undefined;
                    log.error(value + " element is not defined.");
                }
            }
        }

        if(this.isLoaded) {
            log.info("Collision grid generated.");
        }
    },

    isOutOfBounds: function(x, y) {
        return x <= 0 || x >= this.width || y <= 0 || y >= this.height;
    },

    isPlayerColliding: function(x, y) {
        if(this.isOutOfBounds(x, y)) {
            return true;
        }
        return this.tails[x][y]['playerColliding'];
    }
});

var pos = function(x, y) {
    return { x: x, y: y };
};

var equalPositions = function(pos1, pos2) {
    return pos1.x === pos2.x && pos2.y === pos2.y;
};
