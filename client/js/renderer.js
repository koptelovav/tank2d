define(['model'],
    function (Model) {

        var Renderer = Model.extend({
            init: function() {
                this.lastRenderTime = Date.now();
                this.frameCount = 0;
                this.realFPS = 0;
            },

            setScene: function (scene) {
                this.scene = scene;
            },

            renderFrame: function () {
                this.drawDebugInfo();

                _.each(this.scene.layers, function (layer) {
                    this.renderLayer(layer);
                }, this);
            },

            drawFPS: function () {
                var nowTime = Date.now(),
                    diffTime = nowTime - this.lastRenderTime;

                if (diffTime >= 1000) {
                    this.realFPS = this.frameCount;
                    this.frameCount = 0;
                    this.lastRenderTime = nowTime;
                }
                this.frameCount++;
                this.drawText("FPS: " + this.realFPS, 15, 15, false);
            },

            drawText: function (text, x, y, centered, color, strokeColor) {
                var ctx = this.scene.layers[CONST.LAYERS.FOREGROUND].ctx;

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

            drawEntity: function (entity, layer) {
                this.drawImage(entity, layer);
            },

            drawImage: function (entity, layer) {
                var sprite = entity.sprite,
                    anim = entity.currentAnimation;

                if (anim && sprite) {
                    var frame = anim.currentFrame,
                        x = frame.x,
                        y = frame.y,
                        w = sprite.width,
                        h = sprite.height,
                        ox = entity.x,
                        oy = entity.y,
                        dw = w,
                        dh = h;


                    layer.ctx.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
                }
            },

            clearDirtyRect: function (layer, r) {
                layer.ctx.clearRect(r.x, r.y, r.w, r.h);
            },

            renderLayer: function (layer) {
                var self = this,
                    now = Date.now();

                layer.forEachAnimatedEntities(function (entity) {
                    entity.currentAnimation.update(now);
                });

                this.clearLayerDirtyRects(layer);

                layer.ctx.save();
                layer.forEachDirtyEntities(function (entity) {
                    if (entity.sprite.isLoaded) {
                        self.drawEntity(entity, layer);
                        entity.isDirty = false;
                        entity.oldDirtyRect = entity.dirtyRect;
                        entity.dirtyRect = null;
                    }
                });
                layer.ctx.restore();
            },

            clearLayerDirtyRects: function (layer) {
                var self = this;

                layer.forEachDirtyEntities(function (entity) {
                    if (entity.oldDirtyRect) {
                        self.clearDirtyRect(layer, entity.oldDirtyRect);
                    }
                });
            }
        });

        return Renderer;
    });
