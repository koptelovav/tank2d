define(['../../shared/js/tank'], function (Tank) {
    var Player = Tank.extend({
        init: function(config) {
            this.team = config.team;
            this.isReady = config.isReady;

            this.hasEnteredGame = false;
            this.isLoad = false;
            this.isDead = false;
            this.isPlay = false;
            this.isMove = false
            this.isMoveable = false;

            this._super(config.id, "player", config.kind, {
                "speed": 2,
                "armor": 1,
                "bullet": 1
            });
        },

        setOrientation: function (newOrientation) {
            if(this.orientation !== newOrientation){
                this.orientation = newOrientation;
                this.emit('changeOrientation');
                this.setPosition(this.gridX, this.gridY);
            }
        },

        move: function() {
            this.emit('beforeMove', this);

            this.isMove = true;

            if (this.orientation === Types.Orientations.LEFT) this.x-= this.speed;
            else if (this.orientation === Types.Orientations.UP) this.y-= this.speed;
            else if (this.orientation === Types.Orientations.RIGHT) this.x+= this.speed;
            else if (this.orientation === Types.Orientations.DOWN) this.y+= this.speed;
            this.emit('shift', this);

            if((this.x % 16 === 0 && this.x / 16 !== this.gridX) ||
                this.y % 16 === 0 && this.y / 16 !== this.gridY){

                if (this.orientation === Types.Orientations.LEFT) this.gridX--;
                else if (this.orientation === Types.Orientations.UP) this.gridY--;
                else if (this.orientation === Types.Orientations.RIGHT) this.gridX++;
                else if (this.orientation === Types.Orientations.DOWN) this.gridY++;
                this.emit('move', this);
            }
            this.isMove = false;
        },

        shift: function(){

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