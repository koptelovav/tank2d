define(['../../shared/js/tank', '../../shared/js/bullet'], function (Tank) {
    var Player = Tank.extend({
        init: function (id, type, kind, team, isReady) {
            this._super(id, type, kind, {
                "speed": 100,
                "armor": 1,
                "bullet": 1
            });

            this.team = team;
            this.collections = this.collections.concat([Types.Collections.PLAYER]);
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