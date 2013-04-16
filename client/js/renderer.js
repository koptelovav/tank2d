
define(['timer'],
function(Timer) {

    var Renderer = Class.extend({
        init: function(game, canvas, background) {
            this.game = game;

            background.width = 16 * 50;
            background.height = 16 * 50;

            this.context = (canvas && canvas.getContext) ? canvas.getContext("2d") : null;
            this.background = (background && background.getContext) ? background.getContext("2d") : null;

            this.canvas = canvas;
            this.backcanvas = background;

            this.tilesize = 16;

            this.lastTime = new Date();
            this.frameCount = 0;
            this.maxFPS = 50;
            this.realFPS = 0;
        },

        getWidth: function() {
            return this.canvas.width;
        },

        getHeight: function() {
            return this.canvas.height;
        },

        renderFrame: function() {
            this.clearScreen(this.context);

            this.context.save();
            this.drawTiles();
            this.context.restore();
        },

        clearScreen: function(ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },

        drawTiles: function() {
            var self = this;

            this.game.forEachTiles(function(tail, x, y) {
                self.drawTile(tail, x, y);
                });

        },

        drawTile: function(tail, x, y){
            var self = this;

            if(tail.kind !== 'empty'){
                var image = new Image();
                image.src = 'http://tank2d.local/client/images/map/'+tail.kind+'.png';
                image.onload = function(){
                    self.background.drawImage(image,
                        x * self.tilesize,
                        y * self.tilesize,
                        self.tilesize,
                        self.tilesize);
                }
            }
        }
    });

    return Renderer;
});
