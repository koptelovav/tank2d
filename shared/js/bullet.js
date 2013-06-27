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

            if (this.orientation === Types.Orientations.LEFT ||
                this.orientation === Types.Orientations.RIGHT) {
                this.setSize(16,8);
            }
            else if (this.orientation === Types.Orientations.UP ||
                this.orientation === Types.Orientations.DOWN) {
                this.setSize(8,16);
            }
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
        }
    });

    return Bullet;
});