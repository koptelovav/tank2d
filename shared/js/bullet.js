define(['../../shared/js/movableentity'],function (MovableEntity) {
    var Bullet = MovableEntity.extend({
        init: function (id, type, kind, player, speed){
            this._super(id, type, kind);
            this.player = player;
            this.speed = speed;
            this.orientation = player.orientation;

            this.setPosition(player.gridX, player.gridY);
            this.setStartPosition();

        },

        setStartPosition: function(){
            if (this.orientation === Types.Orientations.LEFT) this.x-= 16;
            else if (this.orientation === Types.Orientations.UP) this.y-= 16;
            else if (this.orientation === Types.Orientations.RIGHT) this.x+= 16;
            else if (this.orientation === Types.Orientations.DOWN) this.y+= 16;
        }
    });

    return Bullet;
});