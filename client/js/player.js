define(['tank'], function (Tank) {
    var Player = Tank.extend({
        init: function(config) {
            this.team = config.team;
            this.isReady = config.isReady;
            this.hasEnteredGame = false;
            this.isDead = false;

            this._super(config.id, "player", config.kind, {
                "speed": 20,
                "armor": 1,
                "bullet": 1
            });
        },

        move: function(){
            if(this.orientation === Types.Orientations.LEFT) this.x--;
            else if(this.orientation === Types.Orientations.UP) this.y--;
            else if(this.orientation === Types.Orientations.RIGHT) this.x++;
            else if(this.orientation === Types.Orientations.DOWN) this.y++;
        }
    });

    return Player;
});