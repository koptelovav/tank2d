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
            this.fireDelay = 250;
            this.lastFireTime = Date.now();
            this.bullets = {};

            this._super(id, type, kind, {
                "speed": 2,
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
        },

        toggleFire: function(){
            this.fire = !this.fire;
        },

        canFire: function(){
            var dateNow = Date.now();

            if(this.fire && (dateNow - this.lastFireTime > this.fireDelay)){
                this.lastFireTime = dateNow;
                return true
            }
            return false;
        }
    });

    return Player;
});