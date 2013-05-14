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
            if (this.orientation === Types.Orientations.LEFT){this.x = this.player.x; this.y= this.player.y+12}
            else if (this.orientation === Types.Orientations.UP){this.x = this.player.x+12; this.y= this.player.y}
            else if (this.orientation === Types.Orientations.RIGHT){this.x = this.player.x+20; this.y= this.player.y+12}
            else if (this.orientation === Types.Orientations.DOWN){this.x = this.player.x+12; this.y= this.player.y+20}
        }
    });

    return Bullet;
});