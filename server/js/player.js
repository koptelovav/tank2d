define(['../../shared/js/tank'], function (Tank) {
    var Player = Tank.extend({
        init: function (connection, game) {
            this.connection = connection;
            this.server = game;

            this.team = null;

            this.hasEnteredGame = false;
            this.isReady = false;
            this.isLoad = false;
            this.isMove = false;
            this.isDead = false;

            this._super(this.connection.id, "player", Types.Entities.TANK, {
                "speed": 20,
                "armor": 1,
                "bullet": 1
            });
        },

        setOrientation: function (newOrientation) {
            this.orientation = newOrientation;
        },

        move: function () {
            this.emit('beforeMove', this);

            if (this.orientation === Types.Orientations.LEFT) this.x--;
            else if (this.orientation === Types.Orientations.UP) this.y--;
            else if (this.orientation === Types.Orientations.RIGHT) this.x++;
            else if (this.orientation === Types.Orientations.DOWN) this.y++;
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