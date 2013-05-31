define(['../../shared/js/tank', '../../shared/js/bullet'], function (Tank) {
    var Player = Tank.extend({
        init: function (id, type, kind, team, isReady) {
            this.team = team;
            this.isReady = isReady;

            this.hasEnteredGame = false;
            this.isLoad = false;
            this.isDead = false;
            this.isPlay = false;
            this.isMovable = false;
            this.fire = true;

            this.bullets = {};

            this._super(id, type, kind, {
                "speed": 200,
                "armor": 1,
                "bullet": 1
            });
        },

        getState: function () {
            var state = [
                this.id,
                this.type,
                this.kind,
                this.x,
                this.y,
                this.team,
                this.isReady
            ];
            return state;
        }
    });

    return Player;
});