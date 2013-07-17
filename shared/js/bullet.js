define(['movableentity'], function (MovableEntity) {
    var Bullet = MovableEntity.extend({
        init: function (id, type, kind, player, speed) {
            this._super(id, type, kind);
            this.player = player;
            this.speed = speed;
            this.damage = 40;
            this.isMovable = true;
            this.strength = 1;
            this.setOrientation(player.orientation);
            this.collections = this.collections.concat([CONST.COLLECTIONS.BULLET]);
            this.impact = [
                {
                    type: CONST.IMPACT.DAMAGE,
                    power: 40
                }
            ];

            this.layer = CONST.LAYERS.ENTITIES;
            this.animated = true;
            this.strength = 1;
            this.life = 1;
            this.colliding =  [
                CONST.ENTITIES.TANK,
                CONST.ENTITIES.BULLET,
                CONST.ENTITIES.WALL,
                CONST.ENTITIES.ARMOREDWALL
            ];

            this.setPosition(player.gridX, player.gridY);

            if (this.orientation === CONST.ORIENTATIONS.LEFT ||
                this.orientation === CONST.ORIENTATIONS.RIGHT) {
                this.setSize(16,8);
            }
            else if (this.orientation === CONST.ORIENTATIONS.UP ||
                this.orientation === CONST.ORIENTATIONS.DOWN) {
                this.setSize(8,16);
            }
            this.setStartPosition();
        },

        setStartPosition: function () {
            var dSize = this.height > this.width ? this.width : this.height;
            this.x = this.player.x + this.player.height / 2 - dSize / 2;
            this.y = this.player.y + this.player.width / 2 - dSize / 2;

            if (this.orientation === CONST.ORIENTATIONS.LEFT) this.x -= this.player.height / 2;
            else if (this.orientation === CONST.ORIENTATIONS.UP) this.y -= this.player.width / 2;
            else if (this.orientation === CONST.ORIENTATIONS.RIGHT) this.x += this.player.height / 2;
            else if (this.orientation === CONST.ORIENTATIONS.DOWN) this.y += this.player.width / 2;
        }
    });

    return Bullet;
});