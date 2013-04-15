
define(['timer'],
function(Timer) {

    var Renderer = Class.extend({
        init: function(game, canvas, background) {
            this.game = game;
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

            this.game.forEachTiles(function(tail) {
                self.drawEntity(tail);
            });
        },

        drawEntity: function(entity) {
            console.log(entity);
        },

        drawScaledImage: function(ctx, image, x, y, w, h, dx, dy) {
            var s = this.upscaledRendering ? 1 : this.scale;
            _.each(arguments, function(arg) {
                if(_.isUndefined(arg) || _.isNaN(arg) || _.isNull(arg) || arg < 0) {
                    log.error("x:"+x+" y:"+y+" w:"+w+" h:"+h+" dx:"+dx+" dy:"+dy, true);
                    throw Error("A problem occured when trying to draw on the canvas");
                }
            });

            ctx.drawImage(image,
                          x * s,
                          y * s,
                          w * s,
                          h * s,
                          dx * this.scale,
                          dy * this.scale,
                          w * this.scale,
                          h * this.scale);
        },

        drawTile: function(ctx, tileid, tileset, setW, gridW, cellid) {
            var s = this.upscaledRendering ? 1 : this.scale;
            if(tileid !== -1) { // -1 when tile is empty in Tiled. Don't attempt to draw it.
                this.drawScaledImage(ctx,
                                     tileset,
                                     getX(tileid + 1, (setW / s)) * this.tilesize,
                                     Math.floor(tileid / (setW / s)) * this.tilesize,
                                     this.tilesize,
                                     this.tilesize,
                                     getX(cellid + 1, gridW) * this.tilesize,
                                     Math.floor(cellid / gridW) * this.tilesize);
            }
        }
    });


    
    return Renderer;
});
