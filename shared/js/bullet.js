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

            if (this.orientation === Types.Orientations.LEFT ||
                this.orientation === Types.Orientations.RIGHT) {
                this.setSize(16,8);
            }
            else if (this.orientation === Types.Orientations.UP ||
                this.orientation === Types.Orientations.DOWN) {
                this.setSize(8,16);
            }
            this.setStartPosition();
        },

        setStartPosition: function () {

            this.x = this.player.x + this.player.height / 2 - this.width / 2;
            this.y = this.player.y + this.player.width / 2 - this.height / 2;
        },

        destroy: function(){
            this.toggleMovable();
            this.player.toggleFire();
        }
    });

    return Bullet;
});