define(['../../shared/js/model','timer', '../../shared/js/tile','player'],
    function (Model,Timer, Tile,Player) {

        var Renderer = Model.extend({
            init: function (game, entities, background, foreground) {
                this.game = game;

                background.width = entities.width = foreground.width = 16 * 48;
                background.height = entities.height = foreground.height = 16 * 48;

                this.entities = (entities && entities.getContext) ? entities.getContext("2d") : null;
                this.background = (background && background.getContext) ? background.getContext("2d") : null;
                this.foreground = (foreground && foreground.getContext) ? foreground.getContext("2d") : null;

                this.ecanvas = entities;
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
                this.clearDirtyRects();

                this.entities.save();
                this.background.save();
                this.foreground.save();

                this.drawEntities();
                this.drawDebugInfo();

                this.entities.restore();
                this.background.restore();
                this.foreground.restore();

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
                var ctx = this.foreground;

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
                this.drawImage(this[entity.layer],entity);
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
                    if (entity.isLoaded && entity.sprite.isLoaded) {
                        if(entity.isDirty) {
                            self.drawEntity(entity);
                            entity.isDirty = false;
                            entity.oldDirtyRect = entity.dirtyRect;
                            entity.dirtyRect = null;
                        }
                    }
                });
            },

            clearDirtyRect: function(layer,r) {
                this[layer].clearRect(r.x, r.y, r.w, r.h);
            },

            clearDirtyRects: function() {
                var self = this

                this.game.forEachVisibleEntity(function(entity) {
                    if(entity.isDirty && entity.oldDirtyRect) {
                        self.clearDirtyRect(entity.layer,entity.oldDirtyRect);
                    }
                });
            },

            getEntityBoundingRect: function(entity){
                var rect = {};

                rect.x = entity.x * 16;
                rect.y = entity.y * 16;
                rect.h = entity.sprite.height;
                rect.w = entity.sprite.width;

                return rect;
            }
        });

        return Renderer;
    });
