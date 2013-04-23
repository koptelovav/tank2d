define(['timer', 'tile','player'],
    function (Timer, Tile,Player) {

        var Renderer = Class.extend({
            init: function (game, entities, background, foreground) {
                this.game = game;

                background.width = entities.width = foreground.width = 16 * 50;
                background.height = entities.height = foreground.height = 16 * 50;

                this.context = (entities && entities.getContext) ? entities.getContext("2d") : null;
                this.background = (background && background.getContext) ? background.getContext("2d") : null;
                this.foreground = (foreground && foreground.getContext) ? foreground.getContext("2d") : null;

                this.entities = entities;
                this.backcanvas = background;

                this.images = {};

                this.tilesize = 16;

                this.lastTime = new Date();
                this.frameCount = 0;
                this.maxFPS = 50;
                this.realFPS = 0;
            },

            getWidth: function () {
                return this.entities.width;
            },

            getHeight: function () {
                return this.entities.height;
            },

            renderFrame: function (render_callback) {
                this.clearScreen(this.context);

                this.context.save();
                this.drawEntities();
                this.drawDebugInfo();
                this.context.restore();

                if (render_callback) {
                    render_callback();
                }
                console.log('Frame rendered');
            },

            clearScreen: function (ctx) {
                ctx.clearRect(0, 0, this.entities.width, this.entities.height);
            },

            drawFPS: function () {
                var nowTime = new Date(),
                    diffTime = nowTime.getTime() - this.lastTime.getTime();

                if (diffTime >= 1000) {
                    this.realFPS = this.frameCount;
                    this.frameCount = 0;
                    this.lastTime = nowTime;
                }
                this.frameCount++;

                //this.drawText("FPS: " + this.realFPS + " / " + this.maxFPS, 30, 30, false);
                this.drawText("FPS: " + this.realFPS, 15, 15, false);
            },

            drawText: function (text, x, y, centered, color, strokeColor) {
                var ctx = this.context;

                if (text && x && y) {
                    ctx.save();
                    if (centered) {
                        ctx.textAlign = "center";
                    }
                    ctx.strokeStyle = strokeColor || "#373737";
                    ctx.lineWidth = 3;
                    ctx.strokeText(text, x, y);
                    ctx.fillStyle = color || "white";
                    ctx.fillText(text, x, y);
                    ctx.restore();
                }
            },

            drawDebugInfo: function () {
                this.drawFPS();
            },

            drawEntity: function (entity) {
                var sprite = entity.sprite;

                if (entity instanceof Player) {
                    this.drawImage(this.context,entity);
                }else if (entity instanceof Tile) {
                    this.drawImage(this[entity.layer],entity);
                }
            },

            drawImage: function(contex, entity){
                var sprite = entity.sprite;

                contex.drawImage(sprite.image,
                    entity.x * 16,
                    entity.y * 16,
                    sprite.width,
                    sprite.height);
            },

            drawEntities: function () {
                var self = this;

                this.game.forEachVisibleEntity(function (entity) {
                    if (entity.isLoaded) {
                        self.drawEntity(entity);
                    }
                });
            }
        });

        return Renderer;
    });
