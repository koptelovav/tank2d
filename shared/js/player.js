define(['tank', 'bullet'], function (Tank) {
    var Player = Tank.extend({
        init: function (id, type, kind, team, isReady) {
            this._super(id, CONST.TYPES.PLAYER, kind, {
                "speed": 100,
                "strength": 1,
                "bullet": 1
            });

            this.team = team;
            this.collections = this.collections.concat([CONST.COLLECTIONS.PLAYER]);
            this.isReady = isReady;
            this.hasEnteredGame = false;
            this.isLoad = false;
            this.isDead = false;
            this.isPlay = false;
            this.isMovable = false;

            this.fire = true;
            this.fireDelay = 250;
            this.bulletCount = 0;
            this.maxBulletCount = 1;
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

        canFire: function(){
            var dateNow = Date.now();

            if((Date.now() - this.lastFireTime > this.fireDelay) && this.bulletCount < this.maxBulletCount){
                return true
            }
            return false;
        }
    });

    return Player;
});