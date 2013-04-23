
define(['jquery', 'tile'], function($,TileFactory) {
    
    var Map = Class.extend({
        init: function(game) {
            this.game = game;
        	this.data = [];
        	this.isLoaded = false;
        	this.mapLoaded = false;

            this._loadMap();
        },

        ready: function(func) {
            this.ready_func = func;
        },

        _checkReady: function() {
            if(this.mapLoaded) {
                this.isLoaded = true;
                if(this.ready_func) {
                    this.ready_func();
                }
            }
        },

        _loadMap: function(){
            var self = this;
            console.info("Loading map via Ajax.");
            var filepath = '../../shared/maps/level1.json';
            $.get(filepath, function (data) {
                self._initMap(data);
                self.mapLoaded = true;
                self._checkReady();
            }, 'json');
        },

        _initMap: function(map) {
            this.width = map.width;
            this.height = map.height;
            this.tiles = map.tiles;
            this.tilesize = map.tilesize;
            this.teamcount = map.teamcount;
        },

        isOutOfBounds: function (x, y) {
            return x < 0 || x > this.width || y < 0 || y > this.height;
        },

        isPlayerColliding: function (x, y) {
            if (this.isOutOfBounds(x, y)) {
                return true;
            }

            for(var id in this.game.tiles[x][y]){
                if(this.game.tiles[x][y][id]['tankColliding']) return true;
            }
            return false;

           return this.game.tiles[x][y]['tankColliding'];
        }

    });
    
    return Map;
});
