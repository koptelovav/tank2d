define(['../../shared/js/movableentity'], function (MovableEntity) {
    var Bullet = MovableEntity.extend({
        init: function (id, type, kind, player, speed) {
            this._super(id, type, kind);
            this.player = player;
            this.speed = speed;
            this.damage = 30;
            this.strength = 1;
            this.orientation = player.orientation;

            this.setPosition(player.gridX, player.gridY);
            this.setStartPosition();
            this.setSize(4);
        },

        setStartPosition: function () {
            if (this.orientation === Types.Orientations.LEFT) {
                this.x = this.player.x-4;
                this.y = this.player.y + 12
            }
            else if (this.orientation === Types.Orientations.UP) {
                this.x = this.player.x + 12;
                this.y = this.player.y-4
            }
            else if (this.orientation === Types.Orientations.RIGHT) {
                this.x = this.player.x + 28;
                this.y = this.player.y + 12
            }
            else if (this.orientation === Types.Orientations.DOWN) {
                this.x = this.player.x + 12;
                this.y = this.player.y + 28;
            }
        },

        destroy: function(){
            this.toggleMovable();
            this.player.toggleFire();
        },

        getChunk: function(){
            var chunk = [[this.gridX, this.gridY]],
                gridX2 = this.gridX,
                gridY2 = this.gridY;

            if (this.orientation === Types.Orientations.LEFT ||
                this.orientation === Types.Orientations.RIGHT) {
                gridY2 ++;
            }
            else if (this.orientation === Types.Orientations.UP ||
                this.orientation === Types.Orientations.DOWN) {
                gridX2 ++;
            }

            chunk.push([gridX2,gridY2]);

            return chunk;
        },

        getViewChunk: function(){
            var chunk = [[this.x, this.y]],
                x2 = this.x,
                y2 = this.y;

            if (this.orientation === Types.Orientations.LEFT ||
                this.orientation === Types.Orientations.RIGHT) {
                y2 += 16;
            }
            else if (this.orientation === Types.Orientations.UP ||
                this.orientation === Types.Orientations.DOWN) {
                x2 +=16;
            }

            chunk.push([x2,y2]);

            return chunk;
        }
    });

    return Bullet;
});