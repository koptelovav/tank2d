
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
                self._generateStaticGrid();
                self.mapLoaded = true;
                self._checkReady();
            }, 'json');
        },

        _initMap: function(map) {
            this.width = map.width;
            this.height = map.height;
            this.tails = map.tails;
        },

        _generateStaticGrid: function() {
            var self = this,
                kind;

            for (var j, i = 0; i < self.height; i++) {
                for (j = 0; j < self.width; j++) {
                    if ((kind = Types.getKindAsString(self.tails[i][j])) !== undefined) {
                        self.tails[i][j] = MapElementFactory.create(kind);
                    } else {
                        self.tails[i][j] = undefined;
                    }
                }
            }
            console.info("Collision grid generated.");
        }
    });
    
    return Map;
});
