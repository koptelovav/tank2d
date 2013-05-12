define(['../../shared/js/tank', '../../shared/js/bullet'], function (Tank, Bullet) {
    var Player = Tank.extend({
        init: function (config) {
            this.team = config.team;
            this.isReady = config.isReady;

            this.hasEnteredGame = false;
            this.isLoad = false;
            this.isDead = false;
            this.isPlay = false;
            this.isMovable = false;

            this.bullets = {};

            this._super(config.id, "player", config.kind, {
                "speed": 2,
                "armor": 1,
                "bullet": 1
            });
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