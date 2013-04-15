
define(['renderer','map','../../shared/js/gametypes'],
function(Renderer,Map) {
    
    var Game = Class.extend({
        init: function(app) {
            this.app = app;
            this.ready = false;
            this.started = false;

            this.renderer = null;

            // Game state
            this.entities = {};
            this.tails = null;

        },

        loadMap: function() {
            var self = this;

            this.map = new Map(this);

            this.map.ready(function() {
                console.info("Map loaded.");
            });
        },

        setup: function(canvas, background) {
            this.setRenderer(new Renderer(this, canvas, background));
        },

        setRenderer: function(renderer){
            this.renderer = renderer;
        },

        start: function(){
            this.renderer.renderFrame();
        },

        forEachTiles: function(callback){
            _.each(this.map.tails, function(tail) {
                callback(tail);
            });
        }
    });
    
    return Game;
});
