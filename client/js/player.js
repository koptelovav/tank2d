define(['tank'], function (Tank) {
    var Player = Tank.extend({
        init: function(config) {
            this.team = config.team;
            this.isReady = config.isReady;
            this.hasEnteredGame = false;
            this.isDead = false;

            this._super(config.id, "player", config.kind, config.x, config.y, config.orientation, {
                "speed": 20,
                "armor": 1,
                "bullet": 1
            });
        }
    });

    return Player;
});