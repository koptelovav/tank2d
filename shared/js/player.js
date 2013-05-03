define(['../../shared/js/tank'], function (Tank) {
    var Player = Tank.extend({
        init: function(config) {
            this.team = config.team;
            this.isReady = config.isReady;

            this.hasEnteredGame = false;
            this.isLoad = false;
            this.isDead = false;
            this.isPlay = false;

            this.layer = 'entities';

            this._super(config.id, "player", config.kind, {
                "speed": 200,
                "armor": 1,
                "bullet": 1
            });
        },

        setOrientation: function (newOrientation) {
            this.orientation = newOrientation;
        },

        move: function() {
            this.emit('beforeMove', this);

            if (this.orientation === Types.Orientations.LEFT) this.x--;
            else if (this.orientation === Types.Orientations.UP) this.y--;
            else if (this.orientation === Types.Orientations.RIGHT) this.x++;
            else if (this.orientation === Types.Orientations.DOWN) this.y++;
            this.setDirty();
        },

        getState: function () {
            var state = [
                this.id,
                this.kind,
                this.team,
                this.isReady
            ];
            return state;
        }
    });

    return Player;
});