define(['../../shared/js/tank'], function (Tank) {
    var Player = Tank.extend({
        init: function(config) {
            this.team = config.team;
            this.isReady = config.isReady;

            this.hasEnteredGame = false;
            this.isLoad = false;
            this.isDead = false;
            this.isPlay = false;

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
            if (this.orientation === Types.Orientations.LEFT) this.gridX--;
            else if (this.orientation === Types.Orientations.UP) this.gridY--;
            else if (this.orientation === Types.Orientations.RIGHT) this.gridX++;
            else if (this.orientation === Types.Orientations.DOWN) this.gridY++;
            this.setPosition(this.gridX, this.gridY);

            this.emit('move', this);
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