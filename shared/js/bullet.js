define(['../../shared/js/movableentity'], function (MovableEntity) {
    var Bullet = MovableEntity.extend({
        init: function (id, type, kind, player, speed) {
            this._super(id, type, kind);
            this.player = player;
            this.speed = speed;
            this.damage = 1;
            this.orientation = player.orientation;

            this.setPosition(player.gridX, player.gridY);
            this.setStartPosition();
            this.setSize(2);

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

        getNextPosition: function(){
            var x = this.gridX,
                y = this.gridY;

            if (this.orientation === Types.Orientations.LEFT) x--;
            else if (this.orientation === Types.Orientations.UP) y--;
            else if (this.orientation === Types.Orientations.RIGHT) x++;
            else if (this.orientation === Types.Orientations.DOWN) y++;

            return [x, y];
        }
    });

    return Bullet;
});