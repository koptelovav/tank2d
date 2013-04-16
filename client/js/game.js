
define(['renderer','map','mapelement','gameclient','../../shared/js/gametypes'],
function(Renderer,Map,MapElementFactory,GameClient) {

    var Game = Class.extend({
        init: function(app) {
            this.app = app;
            this.ready = false;
            this.started = false;
            this.canStart = false;

            this.renderer = null;

            this.client = null;

            // Game state
            this.entities = {};
        },

        load: function(){
            if(this.load_func){
                this.load_func();
            }
        },

        onRuning: function(func){
            this.running_func = func;
        },

        loadMap: function() {
            var self = this;

            this.map = new Map(this);

            this.map.ready(function() {
                self.mapGrid = self.map.tiles;
                self.teamCount = self.map.teamcount;
                console.info("Map loaded.");
            });
        },

        setup: function(canvas, background) {
            this.setRenderer(new Renderer(this, canvas, background));
        },

        setRenderer: function(renderer){
            this.renderer = renderer;
        },

        run: function(started_callback) {
            var self = this;

            var wait = setInterval(function() {
                if(self.map.isLoaded) {
                    self.ready = true;

                    self.connect(started_callback);

                    if(self.running_func){
                        self.running_func();
                    }

                    clearInterval(wait);
                }
            }, 100);
        },

        generateStaticGrid: function() {
            var self = this,
                kind;

            for (var j, i = 0; i < self.map.height; i++) {
                for (j = 0; j < self.map.width; j++) {
                    if ((kind = Types.getKindAsString(self.mapGrid[i][j])) !== undefined) {
                        self.mapGrid[i][j] = MapElementFactory.create(kind);
                    } else {
                        self.mapGrid[i][j] = undefined;
                    }
                }
            }
            console.info("Collision grid generated.");
        },

        start: function(){
            this.generateStaticGrid();
            this.tick();
            console.info("Game loop started.");
        },

        tick: function() {
            if(this.started) {
                this.renderer.renderFrame();
            }
        },

        connect: function(connect_func){
            var self = this;

            this.client = new GameClient('127.0.0.1','8000');
            this.client.connect();

            this.client.onConnected(function() {
                console.info("Starting client/server handshake");

                self.started = true;
                self.start();
                self.client.sendHello();
            });
        },

        forEachTiles: function(callback){
            for (var j, i = 0; i < this.map.height; i++) {
                for (j = 0; j < this.map.width; j++) {
                    callback(this.mapGrid[i][j], i, j);
                }
            }
        }
    });
    
    return Game;
});
