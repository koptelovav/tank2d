define(['tank'], function (Tank) {
    var Player = Tank.extend({
        init: function(id) {
            this.hasEnteredGame = false;
            this.isDead = false;

            this._super(id, "player", Types.Entities.TANK, 1.5, 1.5, Types.Orientations.UP, {
                "speed": 20,
                "armor": 1,
                "bullet": 1
            });
        }
    });

    return Player;
});