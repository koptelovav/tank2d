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
            var dSize = this.height > this.width ? this.width : this.height;
            this.x = this.player.x + this.player.height / 2 - dSize / 2;
            this.y = this.player.y + this.player.width / 2 - dSize / 2;

            if (this.orientation === Types.Orientations.LEFT) this.x -= this.player.height / 2;
            else if (this.orientation === Types.Orientations.UP) this.y -= this.player.width / 2;
            else if (this.orientation === Types.Orientations.RIGHT) this.x += this.player.height / 2;
            else if (this.orientation === Types.Orientations.DOWN) this.y += this.player.width / 2;
        },

        destroy: function(){
            this.toggleMovable();
            this.player.toggleFire();
        }
    });

    return Bullet;
});