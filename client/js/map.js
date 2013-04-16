
define(['jquery', 'mapelement'], function($,MapElementFactory) {
    
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
        }
    });
    
    return Map;
});
